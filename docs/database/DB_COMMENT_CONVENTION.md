# DB 테이블·컬럼 설명 작성 규칙 (ISO/IEC 11179 기준)

작성: 2026-10-14 14:30 KST · 최종 갱신: 2026-10-14 14:58 KST (영어는 데이터 사전으로 분리)

DB 의 모든 테이블과 컬럼에는 설명(`COMMENT`)을 단다. 설명은 엔티티의 `@Comment` 에 쓰고, DB 에는 Hibernate 가 옮긴다. 영어 이름과 정의는 데이터 사전 파일에 따로 둔다. 이 문서는 두 가지를 ISO/IEC 11179 의 명명 규칙(5부)과 정의 규칙(4부)에 맞춰 쓰는 방법을 정한다.

## 1. 언어별로 두는 곳

| 위치 | 언어 | 내용 |
|---|---|---|
| 엔티티 `@Comment` → DB `COMMENT` | 한국어 | 명칭, 정의, 값 영역 |
| 데이터 사전 `src/main/resources/db/comments/data-dictionary.csv` | 한국어, 영어 | 언어마다 명칭·정의·값 영역을 별도 열로 둔다 |

ISO/IEC 11179-3 은 이름과 정의를 언어마다 별도 항목으로 관리하고, 행정안전부 공통표준용어도 한글명과 영문명을 별도 속성으로 둔다. PostgreSQL 은 대상마다 설명을 한 칸만 두므로 그 칸에는 한국어만 넣고, 영어는 데이터 사전의 별도 열에 둔다.

## 2. DB 설명의 형식

```text
<명칭>: <정의> (값 영역: <허용 값·형식·단위>)
```

| 부분 | 필수 | 내용 |
|---|---|---|
| 명칭 | 예 | 객체 클래스 + 특성 + 표현 용어. 테이블은 객체 클래스만 쓴다 |
| 정의 | 예 | 그 데이터가 무엇인지 서술하는 설명구. 마침표 없이 끝낸다 |
| 값 영역 | 아니오 | 코드·enum·주석·제약으로 확인한 허용 값, 형식, 단위. 확인하지 못했으면 쓰지 않는다 |

예시:

```text
테스트 케이스: 프로젝트 안에서 관리하는 테스트 절차 하나, 또는 테스트 케이스를 묶는 폴더
유형 코드: 트리에서 이 행이 맡는 역할 (값 영역: testcase, folder, systemFolder)
프로젝트 식별자: 이 테스트 케이스가 속한 프로젝트 (값 영역: projects.id 참조)
자동화 여부: 이 테스트 케이스가 자동화 테스트로 실행되는지 나타내는 값 (값 영역: true, false)
```

## 3. 명칭: 객체 클래스 + 특성 + 표현 용어

ISO/IEC 11179-5 는 데이터 요소의 이름을 세 부분으로 짓는다. 객체 클래스는 무엇에 대한 데이터인지(테스트 케이스), 특성은 그 대상의 어떤 성질인지(유형), 표현 용어는 값이 어떤 형태인지(코드)를 나타낸다. 객체 클래스가 테이블 이름과 같으면 생략해도 된다(`testcases.name` → `테스트 케이스 명` 또는 `명칭`).

표현 용어는 아래 목록에서 고른다. 같은 형태의 값에는 테이블이 달라도 같은 용어를 쓴다. 데이터 사전의 영어 명칭도 같은 순서(`Object Class + Property + Representation Term`)로 짓는다(`프로젝트 식별자` → `Project Identifier`).

| 표현 용어 | 영어 | 쓰는 경우 | 예 |
|---|---|---|---|
| 식별자 | Identifier | 행을 유일하게 가리키는 값, 다른 행을 참조하는 값 | 프로젝트 식별자 |
| 번호 | Number | 사람이 읽는 일련번호 | 순차 번호 |
| 명 | Name | 짧은 이름 | 프로젝트 명 |
| 내용 | Text | 여러 줄이 될 수 있는 본문 | 사전 조건 내용 |
| 코드 | Code | 정해진 값 집합 가운데 하나 | 우선순위 코드 |
| 여부 | Indicator | 참·거짓 | 활성 여부 |
| 일시 | Date Time | 날짜와 시각 | 생성 일시 |
| 일자 | Date | 날짜만 | 방문 일자 |
| 수 | Count | 개수 | 실패 수 |
| 순서 | Order | 정렬 위치 | 표시 순서 |
| 크기 | Size | 바이트 수 | 파일 크기 |
| 시간 | Duration | 걸린 시간 | 실행 시간 |
| 경로 | Path | 파일·저장소 경로 | 저장 경로 |
| URL | URL | 웹 주소 | 서버 URL |
| 목록 | List | JSON 배열 등 여러 값을 한 칸에 담은 것 | 태그 목록 |
| 값 | Value | 위 어디에도 해당하지 않는 단일 값 | 설정 값 |

## 4. 정의: ISO/IEC 11179-4 규칙

**반드시 지킨다.**

| 규칙 | 지키지 않은 예 | 고친 예 |
|---|---|---|
| 단수형으로 쓴다 | 테스트 케이스들의 이름 | 테스트 케이스의 이름 |
| 무엇인지를 쓴다. 무엇이 아닌지를 쓰지 않는다 | 폴더가 아닌 항목 | 실행 단위가 되는 항목 |
| 설명구로 쓴다 | 이름 | 사용자가 트리에서 보는 테스트 케이스의 이름 |
| 약어는 처음 나올 때 풀어 쓴다 | TC 이름 | 테스트 케이스 이름 |
| 다른 데이터 요소의 정의를 끌어오지 않는다 | `name` 과 같은 의미 | 사용자가 보는 이름 |

**되도록 지킨다.**

- 핵심 특성만 쓴다. 구현 이력, 이슈 번호(`ICT-130`), 인덱스 이유처럼 데이터의 뜻이 아닌 것은 코드 주석에 둔다.
- 기능·용도·절차를 정의에 섞지 않는다. 다만 낙관적 잠금 버전처럼 용도가 곧 뜻인 컬럼은 예외다.
- 명칭을 되풀이해서 정의를 대신하지 않는다(순환 정의 금지). `생성 일시: 생성된 일시` 는 정보가 없다.
- 같은 개념에는 같은 낱말을 쓴다. 한 곳에서 `사용자`, 다른 곳에서 `회원` 이라고 쓰지 않는다.
- 간결하게 쓴다. 글자 수 상한은 두지 않는다. 설명이 잘리지 않고 그대로 보여야 하기 때문이다.

## 5. 값 영역

값 영역에는 코드에서 확인한 것만 쓴다. 근거는 enum 상수, 필드 주석, 서비스의 상수·검증 로직, 컬럼 길이 제약이다. 추측으로 채우지 않는다.

| 데이터 형태 | 값 영역 표기 |
|---|---|
| UUID 기본키 | `UUID 36자` |
| 외래키 | `<테이블>.<컬럼> 참조` (형식이 있으면 함께) |
| enum·상수 | 실제로 저장되는 문자열을 쉼표로 나열 |
| 참·거짓 | `true, false` |
| 크기·시간 | 단위(`바이트`, `밀리초`, `초`) |
| JSON | `JSON 배열` 또는 `JSON 객체`, 확인되면 원소 형태 |
| 암호화 값 | `암호문`. 평문의 형식이나 키 정보는 적지 않는다 |

## 6. 공통 컬럼의 표준 설명

여러 테이블에 같은 뜻으로 나오는 컬럼은 아래 문구를 그대로 쓴다. 테이블마다 뜻이 다르면(예: `created_by` 에 사용자명이 아니라 사용자 식별자가 들어가는 경우) 실제 내용에 맞게 고쳐 쓴다.

| 컬럼 | DB 설명 | 데이터 사전 영어 명칭 · 정의 |
|---|---|---|
| `created_at` | `생성 일시: 이 행이 처음 저장된 일시` | `Created Date Time` · `date and time this row was first saved` |
| `updated_at` | `수정 일시: 이 행이 마지막으로 변경된 일시` | `Updated Date Time` · `date and time this row was last changed` |
| `created_by` | `생성자 명: 이 행을 처음 저장한 사용자의 사용자명` | `Creator Name` · `username of the user who first saved this row` |
| `updated_by` | `수정자 명: 이 행을 마지막으로 변경한 사용자의 사용자명` | `Updater Name` · `username of the user who last changed this row` |
| `version` (`@Version`) | `낙관적 잠금 버전: 동시에 수정한 내용이 서로 덮어쓰지 않도록 저장할 때마다 1씩 늘어나는 번호` | `Optimistic Lock Version` |

## 7. 엔티티에 쓰는 방법

`org.hibernate.annotations.Comment` 를 쓴다.

```java
@Entity
@Comment("테스트 케이스: 프로젝트 안에서 관리하는 테스트 절차 하나, 또는 테스트 케이스를 묶는 폴더")
@Table(name = "testcases")
public class TestCase {

  @Comment("유형 코드: 트리에서 이 행이 맡는 역할 (값 영역: testcase, folder, systemFolder)")
  @Column(columnDefinition = "TEXT")
  private String type;
```

`@ElementCollection`·`@JoinTable` 이 만드는 테이블은 필드 하나에 설명을 여러 개 붙인다. `on` 이 없는 `@Comment` 는 그 테이블의 설명이 되고, `on` 을 준 `@Comment` 는 그 이름의 컬럼 설명이 된다. 조인 컬럼과 순서 컬럼(`@OrderColumn`)도 이 방법으로 단다.

```java
@Comment("테스트 케이스 태그: 테스트 케이스에 붙인 분류 태그")
@Comment(value = "테스트 케이스 식별자: 태그가 붙은 테스트 케이스 (값 영역: testcases.id 참조)", on = "testcase_id")
@Comment(value = "태그 명: 사용자가 붙인 태그 문자열 (값 영역: 100자 이하)", on = "tag")
@ElementCollection
@CollectionTable(name = "testcase_tags", joinColumns = @JoinColumn(name = "testcase_id"))
@Column(name = "tag", length = 100)
private List<String> tags;
```

`@Embeddable` 클래스의 필드에 붙인 설명은 그 클래스를 쓰는 모든 테이블에 들어간다. 그래서 특정 테이블에만 맞는 문구를 쓰지 않는다. `@OneToMany(mappedBy = …)` 처럼 컬럼을 만들지 않는 필드에는 `@Comment` 를 붙이지 않는다. 붙이면 대상 테이블의 설명을 덮어쓴다.

## 8. 데이터 사전

`src/main/resources/db/comments/data-dictionary.csv` 는 테이블·컬럼마다 한 행이고, 열은 다음과 같다. 테이블 행은 `column_name` 이 비어 있다.

| 열 | 채우는 쪽 | 내용 |
|---|---|---|
| `table_name`, `column_name` | 생성 | 물리 이름 |
| `korean_name`, `korean_definition`, `korean_value_domain` | 생성 | `@Comment` 를 명칭·정의·값 영역으로 나눈 값 |
| `english_name` | 사람 | Title Case 명칭(`Test Case Type Code`) |
| `english_definition` | 사람 | 소문자로 시작하는 설명구, 마침표 없음, 미국 영어 |
| `english_value_domain` | 사람 | 한국어 값 영역이 있을 때만 쓴다. 코드 값, enum 상수, 테이블·컬럼 이름은 그대로 두고 한국어 부분만 옮긴다(`projects.id 참조` → `references projects.id`, `100자 이하` → `up to 100 characters`) |

엔티티에 컬럼을 추가하면 다음 순서로 맞춘다.

1. 필드에 `@Comment` 를 단다.
2. `DBCOMMENTS_WRITE=true ./gradlew test --tests '*DbCommentCoverageTest' --rerun` 으로 데이터 사전과 SQL 을 다시 만든다. 이미 채운 영어 열은 그대로 남고, 새 행의 영어 열은 비어 있다.
3. 새 행의 영어 열을 채운다. 비어 있는 동안에는 테스트가 그 행을 짚어 실패한다.

## 9. 기존 DB 에 적용하기

`ddl-auto: update` 는 테이블을 새로 만들 때만 설명을 넣고, 이미 있는 테이블·컬럼의 설명은 바꾸지 않는다. 운영 중인 DB 에는 `src/main/resources/db/comments/db-comments.sql` 을 직접 실행한다.

```bash
psql -h <호스트> -p <포트> -U <사용자> -d testcase_management -f src/main/resources/db/comments/db-comments.sql
```

`COMMENT ON` 은 설명만 바꾸므로 데이터와 스키마에 영향이 없고, 같은 파일을 여러 번 실행해도 결과가 같다. 이 SQL 은 엔티티에서 생성하므로 손으로 고치지 않는다.

## 10. 검사

`DbCommentCoverageTest` 가 다섯 가지를 검사한다.

| 검사 | 실패하는 경우 |
|---|---|
| 모든 테이블과 컬럼에 설명이 있다 | 엔티티를 추가하거나 필드를 늘리면서 `@Comment` 를 빠뜨렸다 |
| 설명은 명칭과 정의를 갖춘 한국어다 | `명칭: 정의` 형식이 아니거나, 한글이 없거나, 영어를 섞었다 |
| 데이터 사전이 엔티티와 일치한다 | 행이 빠졌거나 남았거나, 한국어 열이 `@Comment` 와 다르다 |
| 데이터 사전의 영어 열이 모두 채워져 있다 | 영어 명칭·정의가 비었거나, 한글이 섞였거나, 값 영역이 한쪽에만 있다 |
| `db-comments.sql` 이 엔티티와 같다 | `@Comment` 를 고친 뒤 SQL 을 다시 생성하지 않았다 |

## 참고

- ISO/IEC 11179-3:2013 Registry metamodel and basic attributes
- ISO/IEC 11179-4:2004 Formulation of data definitions
- ISO/IEC 11179-5:2015 Naming principles
- [행정안전부 공공데이터 품질관리 (공통표준용어)](https://mois.go.kr/frt/sub/a06/b02/openData_3/screen.do)
- [Metadata (ISO 11179): 표준 기반 의미 관리 체계](https://rupijun.tistory.com/entry/Metadata-ISO-11179-%ED%91%9C%EC%A4%80-%EA%B8%B0%EB%B0%98-%EC%9D%98%EB%AF%B8-%EA%B4%80%EB%A6%AC-%EC%B2%B4%EA%B3%84)
