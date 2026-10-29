package com.testcase.testcasemanagement.model;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import org.hibernate.annotations.Comment;
import org.hibernate.boot.Metadata;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.model.relational.Namespace;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.mapping.Column;
import org.hibernate.mapping.Table;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * DB 테이블·컬럼 설명(COMMENT)과 데이터 사전 검사.
 *
 * <p>스키마를 {@code ddl-auto: update} 로 만들기 때문에 엔티티에 {@code @Comment} 가 없으면 DB 에도 설명이 생기지
 * 않는다(2026-10-14 실측: 테이블 68개·컬럼 650개 전부 설명 없음). 작성 규칙은 {@code
 * docs/database/DB_COMMENT_CONVENTION.md} 를 따른다.
 *
 * <p>DB 설명은 한국어 한 가지로 둔다. ISO/IEC 11179 는 언어별 이름·정의를 따로 관리하므로, 영어 이름·정의는 데이터 사전 {@code
 * db/comments/data-dictionary.csv} 에 별도 열로 둔다. 데이터 사전의 한국어 열과 {@code db/comments/db-comments.sql} 은
 * 엔티티에서 생성하며, 영어 열은 사람이 채운다. 다시 만들려면 환경 변수 {@code DBCOMMENTS_WRITE=true} 를 주고 실행한다. 이미 채운 영어 열은
 * 유지되고, 새로 생긴 행과 한국어 열이 바뀐 행은 영어 열이 비어 이 테스트가 실패한다.
 */
public class DbCommentCoverageTest {

  private static final String ENTITY_PACKAGE = "com.testcase.testcasemanagement.model";
  private static final Path SQL_FILE = Path.of("src/main/resources/db/comments/db-comments.sql");
  private static final Path DICTIONARY_FILE =
      Path.of("src/main/resources/db/comments/data-dictionary.csv");
  private static final List<String> DICTIONARY_HEADER =
      List.of(
          "table_name",
          "column_name",
          "korean_name",
          "korean_definition",
          "korean_value_domain",
          "english_name",
          "english_definition",
          "english_value_domain");
  private static final Pattern KOREAN_COMMENT =
      Pattern.compile("^([^:]+): (.+?)(?: \\(값 영역: (.+)\\))?$");
  private static final Pattern HANGUL = Pattern.compile("[가-힣]");
  private static final Pattern ENGLISH_NAME = Pattern.compile("^[A-Z][^:]*$");

  private StandardServiceRegistry registry;
  private Metadata metadata;
  private final List<Class<?>> entityClasses = new ArrayList<>();

  @BeforeClass
  public void buildMetadata() throws ClassNotFoundException {
    // 상대 경로로 파일을 읽고 쓰므로, 모듈 루트가 아닌 곳에서 실행하면 엉뚱한 비교나 엉뚱한 위치의 파일 생성이 된다.
    assertTrue(
        Files.isDirectory(SQL_FILE.getParent()),
        SQL_FILE.getParent() + " 이 없다. 작업 디렉터리가 모듈 루트가 아니다: " + Path.of("").toAbsolutePath());
    registry =
        new StandardServiceRegistryBuilder()
            .applySetting("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
            .applySetting("hibernate.boot.allow_jdbc_metadata_access", "false")
            .applySetting(
                "hibernate.physical_naming_strategy",
                "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy")
            .applySetting(
                "hibernate.implicit_naming_strategy",
                "org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy")
            .build();
    MetadataSources sources = new MetadataSources(registry);
    ClassPathScanningCandidateComponentProvider scanner =
        new ClassPathScanningCandidateComponentProvider(false);
    scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
    for (BeanDefinition definition : scanner.findCandidateComponents(ENTITY_PACKAGE)) {
      sources.addAnnotatedClassName(definition.getBeanClassName());
      entityClasses.add(Class.forName(definition.getBeanClassName()));
    }
    metadata = sources.buildMetadata();
  }

  @AfterClass(alwaysRun = true)
  public void closeRegistry() {
    StandardServiceRegistryBuilder.destroy(registry);
  }

  @Test
  public void 모든_테이블과_컬럼에_설명이_있다() {
    List<String> missing = new ArrayList<>();
    for (DbObject object : dbObjects()) {
      if (isBlank(object.comment())) {
        missing.add(object.key());
      }
    }
    assertTrue(missing.isEmpty(), "설명이 없는 테이블·컬럼 " + missing.size() + "개: " + missing);
  }

  @Test
  public void 설명은_명칭과_정의를_갖춘_한국어다() {
    List<String> invalid = new ArrayList<>();
    for (DbObject object : dbObjects()) {
      String comment = object.comment();
      if (isBlank(comment)) {
        continue;
      }
      if (!KOREAN_COMMENT.matcher(comment).matches()
          || !HANGUL.matcher(comment).find()
          || comment.contains(" | ")) {
        invalid.add(object.key());
      }
    }
    assertTrue(invalid.isEmpty(), "형식이 맞지 않는 설명 " + invalid.size() + "개: " + invalid);
  }

  @Test
  public void 데이터_사전이_엔티티와_일치한다() throws IOException {
    String expected = toCsv(expectedDictionary());
    if (isWriteMode()) {
      Files.createDirectories(DICTIONARY_FILE.getParent());
      Files.writeString(DICTIONARY_FILE, expected, StandardCharsets.UTF_8);
    }
    String committed =
        Files.exists(DICTIONARY_FILE)
            ? Files.readString(DICTIONARY_FILE, StandardCharsets.UTF_8)
            : "";
    assertEquals(
        committed,
        expected,
        DICTIONARY_FILE + " 의 행 구성이나 한국어 열이 엔티티와 다르다. DBCOMMENTS_WRITE=true 로 다시 생성한다.");
  }

  @Test
  public void 데이터_사전의_영어_열이_모두_채워져_있다() throws IOException {
    List<String> invalid = new ArrayList<>();
    for (List<String> row : readDictionary().values()) {
      String key = row.get(0) + (row.get(1).isEmpty() ? "" : "." + row.get(1));
      boolean hasKoreanDomain = !row.get(4).isEmpty();
      boolean hasEnglishDomain = !row.get(7).isEmpty();
      if (!ENGLISH_NAME.matcher(row.get(5)).matches()
          || row.get(6).isEmpty()
          || HANGUL.matcher(row.get(5) + row.get(6) + row.get(7)).find()
          || hasKoreanDomain != hasEnglishDomain
          || !domainItems(row.get(7)).containsAll(codeItems(row.get(4)))) {
        invalid.add(key);
      }
    }
    assertTrue(
        invalid.isEmpty(),
        DICTIONARY_FILE + " 에서 영어 열이 비었거나 형식이 맞지 않는 행 " + invalid.size() + "개: " + invalid);
  }

  @Test
  public void enum_컬럼의_값_영역이_enum_상수와_같다() {
    List<String> invalid = new ArrayList<>();
    for (Class<?> entity : entityClasses) {
      for (Field field : entity.getDeclaredFields()) {
        Enumerated enumerated = field.getAnnotation(Enumerated.class);
        Comment comment = field.getAnnotation(Comment.class);
        if (enumerated == null
            || enumerated.value() != EnumType.STRING
            || comment == null
            || !comment.on().isEmpty()
            || !field.getType().isEnum()) {
          continue;
        }
        Set<String> constants = new TreeSet<>();
        for (Object constant : field.getType().getEnumConstants()) {
          constants.add(((Enum<?>) constant).name());
        }
        var matcher = KOREAN_COMMENT.matcher(comment.value());
        Set<String> domain =
            matcher.matches() && matcher.group(3) != null
                ? new TreeSet<>(domainItems(matcher.group(3)))
                : Set.of();
        if (!domain.equals(constants)) {
          invalid.add(
              entity.getSimpleName()
                  + "."
                  + field.getName()
                  + " 설명="
                  + domain
                  + " enum="
                  + constants);
        }
      }
    }
    assertTrue(invalid.isEmpty(), "값 영역이 enum 상수와 다른 컬럼 " + invalid.size() + "개: " + invalid);
  }

  @Test
  public void 기존_DB_적용용_SQL_이_엔티티와_일치한다() throws IOException {
    String generated = generateSql();
    if (isWriteMode()) {
      Files.createDirectories(SQL_FILE.getParent());
      Files.writeString(SQL_FILE, generated, StandardCharsets.UTF_8);
    }
    String committed =
        Files.exists(SQL_FILE) ? Files.readString(SQL_FILE, StandardCharsets.UTF_8) : "";
    assertEquals(committed, generated, SQL_FILE + " 이 엔티티와 다르다. DBCOMMENTS_WRITE=true 로 다시 생성한다.");
  }

  /** 테이블 이름순, 테이블 행 다음에 그 테이블의 컬럼을 이름순으로 둔다. */
  private List<DbObject> dbObjects() {
    List<Table> tables = new ArrayList<>();
    for (Namespace namespace : metadata.getDatabase().getNamespaces()) {
      tables.addAll(namespace.getTables());
    }
    tables.sort(Comparator.comparing(Table::getName));
    List<DbObject> objects = new ArrayList<>();
    for (Table table : tables) {
      objects.add(new DbObject(table.getName(), "", table.getComment()));
      List<Column> columns = new ArrayList<>(table.getColumns());
      columns.sort(Comparator.comparing(Column::getName));
      for (Column column : columns) {
        objects.add(new DbObject(table.getName(), column.getName(), column.getComment()));
      }
    }
    return objects;
  }

  private List<List<String>> expectedDictionary() throws IOException {
    Map<String, List<String>> existing =
        Files.exists(DICTIONARY_FILE) ? readDictionary() : new HashMap<>();
    List<List<String>> rows = new ArrayList<>();
    for (DbObject object : dbObjects()) {
      if (isBlank(object.comment())) {
        continue;
      }
      List<String> row = new ArrayList<>(List.of(object.table(), object.column()));
      var matcher = KOREAN_COMMENT.matcher(object.comment());
      if (matcher.matches()) {
        row.add(matcher.group(1));
        row.add(matcher.group(2));
        row.add(matcher.group(3) == null ? "" : matcher.group(3));
      } else {
        row.addAll(List.of(object.comment(), "", ""));
      }
      List<String> previous = existing.get(object.key());
      // 한국어 열이 바뀐 행은 영어 열을 비워, 번역을 다시 채우기 전까지 영어 열 검사가 실패하게 한다.
      boolean koreanUnchanged =
          previous != null && previous.subList(2, 5).equals(row.subList(2, 5));
      row.addAll(koreanUnchanged ? previous.subList(5, 8) : List.of("", "", ""));
      rows.add(row);
    }
    return rows;
  }

  private Map<String, List<String>> readDictionary() throws IOException {
    List<List<String>> records =
        parseCsv(Files.readString(DICTIONARY_FILE, StandardCharsets.UTF_8));
    assertTrue(!records.isEmpty(), DICTIONARY_FILE + " 이 비어 있다. DBCOMMENTS_WRITE=true 로 다시 생성한다.");
    assertEquals(records.get(0), DICTIONARY_HEADER, DICTIONARY_FILE + " 의 머리행이 다르다.");
    Map<String, List<String>> rows = new LinkedHashMap<>();
    for (List<String> record : records.subList(1, records.size())) {
      assertEquals(
          record.size(), DICTIONARY_HEADER.size(), DICTIONARY_FILE + " 의 열 수가 다른 행: " + record);
      rows.put(record.get(0) + (record.get(1).isEmpty() ? "" : "." + record.get(1)), record);
    }
    return rows;
  }

  private String generateSql() {
    StringBuilder sql = new StringBuilder();
    sql.append("-- 엔티티 @Comment 에서 생성한 파일이다. 직접 고치지 않는다.\n");
    sql.append(
        "-- 생성: DBCOMMENTS_WRITE=true ./gradlew test --tests '*DbCommentCoverageTest' --rerun\n");
    sql.append("-- 규칙: docs/database/DB_COMMENT_CONVENTION.md\n");
    for (DbObject object : dbObjects()) {
      if (object.column().isEmpty()) {
        sql.append('\n');
      }
      if (isBlank(object.comment())) {
        continue;
      }
      sql.append(object.column().isEmpty() ? "COMMENT ON TABLE " : "COMMENT ON COLUMN ")
          .append(object.key())
          .append(" IS ")
          .append(literal(object.comment()))
          .append(";\n");
    }
    return sql.toString();
  }

  private static String toCsv(List<List<String>> rows) {
    StringBuilder csv = new StringBuilder();
    appendCsvRecord(csv, DICTIONARY_HEADER);
    for (List<String> row : rows) {
      appendCsvRecord(csv, row);
    }
    return csv.toString();
  }

  private static void appendCsvRecord(StringBuilder csv, List<String> fields) {
    for (int i = 0; i < fields.size(); i++) {
      if (i > 0) {
        csv.append(',');
      }
      String field = fields.get(i);
      if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
        csv.append('"').append(field.replace("\"", "\"\"")).append('"');
      } else {
        csv.append(field);
      }
    }
    csv.append('\n');
  }

  private static List<List<String>> parseCsv(String text) {
    List<List<String>> records = new ArrayList<>();
    List<String> record = new ArrayList<>();
    StringBuilder field = new StringBuilder();
    boolean quoted = false;
    for (int i = 0; i < text.length(); i++) {
      char c = text.charAt(i);
      if (quoted) {
        if (c == '"' && i + 1 < text.length() && text.charAt(i + 1) == '"') {
          field.append('"');
          i++;
        } else if (c == '"') {
          quoted = false;
        } else {
          field.append(c);
        }
      } else if (c == '"') {
        quoted = true;
      } else if (c == ',') {
        record.add(field.toString());
        field.setLength(0);
      } else if (c == '\n') {
        record.add(field.toString());
        field.setLength(0);
        records.add(record);
        record = new ArrayList<>();
      } else if (c != '\r') {
        field.append(c);
      }
    }
    if (field.length() > 0 || !record.isEmpty()) {
      record.add(field.toString());
      records.add(record);
    }
    return records;
  }

  private static List<String> domainItems(String domain) {
    return domain.isEmpty() ? List.of() : Arrays.asList(domain.split(", "));
  }

  /** 한국어 값 영역에서 한글이 없는 항목(코드 값). 영어 값 영역에도 그대로 있어야 한다. 범위(0~100)는 표기를 옮겨도 되므로 뺀다. */
  private static List<String> codeItems(String domain) {
    return domainItems(domain).stream()
        .filter(item -> !HANGUL.matcher(item).find() && !item.contains("~"))
        .toList();
  }

  private static boolean isWriteMode() {
    return "true".equals(System.getenv("DBCOMMENTS_WRITE"));
  }

  private static String literal(String value) {
    return "'" + value.replace("'", "''") + "'";
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  private record DbObject(String table, String column, String comment) {
    String key() {
      return column.isEmpty() ? table : table + "." + column;
    }
  }
}
