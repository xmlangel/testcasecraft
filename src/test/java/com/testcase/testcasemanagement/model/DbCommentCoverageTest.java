package com.testcase.testcasemanagement.model;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import jakarta.persistence.Entity;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
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
 * DB 테이블·컬럼 설명(COMMENT) 누락 방지 테스트.
 *
 * <p>스키마를 {@code ddl-auto: update} 로 만들기 때문에 엔티티에 {@code @Comment} 가 없으면 DB 에도 설명이 생기지 않는다(2026-10-14
 * 실측: 테이블 68개·컬럼 650개 전부 설명 없음). 작성 규칙은 {@code docs/database/DB_COMMENT_CONVENTION.md} 를 따른다.
 *
 * <p>{@code ddl-auto: update} 는 이미 있는 컬럼의 설명을 갱신하지 않으므로, 기존 DB 에는 {@code db/comments/db-comments.sql}
 * 을 적용한다. 이 파일은 엔티티에서 생성하며 내용이 어긋나면 이 테스트가 실패한다. 다시 만들려면 환경 변수
 * {@code DBCOMMENTS_WRITE=true} 를 주고 실행한다.
 */
public class DbCommentCoverageTest {

  private static final String ENTITY_PACKAGE = "com.testcase.testcasemanagement.model";
  private static final Pattern KOREAN_PART = Pattern.compile("^[^:]+: .*[가-힣].*$");
  private static final Pattern ENGLISH_PART = Pattern.compile("^[A-Z][^:가-힣]*: [^가-힣]+$");
  private static final Path SQL_FILE = Path.of("src/main/resources/db/comments/db-comments.sql");

  private StandardServiceRegistry registry;
  private Metadata metadata;

  @BeforeClass
  public void buildMetadata() {
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
    for (Table table : tables()) {
      if (isBlank(table.getComment())) {
        missing.add(table.getName());
      }
      for (Column column : table.getColumns()) {
        if (isBlank(column.getComment())) {
          missing.add(table.getName() + "." + column.getName());
        }
      }
    }
    assertTrue(missing.isEmpty(), "설명이 없는 테이블·컬럼 " + missing.size() + "개: " + missing);
  }

  @Test
  public void 모든_설명이_한국어와_영어로_되어_있다() {
    List<String> invalid = new ArrayList<>();
    for (Table table : tables()) {
      checkBilingual(table.getName(), table.getComment(), invalid);
      for (Column column : table.getColumns()) {
        checkBilingual(table.getName() + "." + column.getName(), column.getComment(), invalid);
      }
    }
    assertTrue(invalid.isEmpty(), "한국어 | 영어 형식이 아닌 설명 " + invalid.size() + "개: " + invalid);
  }

  private static void checkBilingual(String name, String comment, List<String> invalid) {
    if (isBlank(comment)) {
      return;
    }
    String[] parts = comment.split(" \\| ", -1);
    boolean valid =
        parts.length == 2
            && KOREAN_PART.matcher(parts[0]).matches()
            && ENGLISH_PART.matcher(parts[1]).matches();
    if (!valid) {
      invalid.add(name);
    }
  }

  @Test
  public void 기존_DB_적용용_SQL_이_엔티티와_일치한다() throws IOException {
    String generated = generateSql();
    if ("true".equals(System.getenv("DBCOMMENTS_WRITE"))) {
      Files.createDirectories(SQL_FILE.getParent());
      Files.writeString(SQL_FILE, generated, StandardCharsets.UTF_8);
    }
    String committed =
        Files.exists(SQL_FILE) ? Files.readString(SQL_FILE, StandardCharsets.UTF_8) : "";
    assertEquals(committed, generated, SQL_FILE + " 이 엔티티와 다르다. DBCOMMENTS_WRITE=true 로 다시 생성한다.");
  }

  private List<Table> tables() {
    List<Table> tables = new ArrayList<>();
    for (Namespace namespace : metadata.getDatabase().getNamespaces()) {
      tables.addAll(namespace.getTables());
    }
    tables.sort(Comparator.comparing(Table::getName));
    return tables;
  }

  private String generateSql() {
    StringBuilder sql = new StringBuilder();
    sql.append("-- 엔티티 @Comment 에서 생성한 파일이다. 직접 고치지 않는다.\n");
    sql.append("-- 생성: DBCOMMENTS_WRITE=true ./gradlew test --tests '*DbCommentCoverageTest' --rerun\n");
    sql.append("-- 규칙: docs/database/DB_COMMENT_CONVENTION.md\n");
    for (Table table : tables()) {
      sql.append('\n');
      if (!isBlank(table.getComment())) {
        sql.append("COMMENT ON TABLE ")
            .append(table.getName())
            .append(" IS ")
            .append(literal(table.getComment()))
            .append(";\n");
      }
      List<Column> columns = new ArrayList<>(table.getColumns());
      columns.sort(Comparator.comparing(Column::getName));
      for (Column column : columns) {
        if (isBlank(column.getComment())) {
          continue;
        }
        sql.append("COMMENT ON COLUMN ")
            .append(table.getName())
            .append('.')
            .append(column.getName())
            .append(" IS ")
            .append(literal(column.getComment()))
            .append(";\n");
      }
    }
    return sql.toString();
  }

  private static String literal(String value) {
    return "'" + value.replace("'", "''") + "'";
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
