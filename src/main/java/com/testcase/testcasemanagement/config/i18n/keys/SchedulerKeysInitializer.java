// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/SchedulerKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchedulerKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        System.out.println("SchedulerKeysInitializer.initialize() 시작!");
        log.info("스케줄러 번역 키 초기화 시작");

        // 스케줄러 관리 페이지 (SchedulerManagement.jsx)
        createTranslationKeyIfNotExists("scheduler.title", "scheduler", "스케줄러 관리 페이지 제목", "스케줄러 관리");
        createTranslationKeyIfNotExists("scheduler.description", "scheduler", "스케줄러 관리 페이지 설명",
                "백그라운드 작업의 실행 시간을 동적으로 관리합니다. Cron 표현식을 변경하면 서버 재시작 없이 즉시 반영됩니다.");
        createTranslationKeyIfNotExists("scheduler.currentTime", "scheduler", "현재 시간 라벨", "현재 시간 ({timezone})");
        createTranslationKeyIfNotExists("scheduler.refresh", "scheduler", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("scheduler.status.changed", "scheduler", "스케줄 상태 변경 성공 메시지",
                "스케줄 상태가 변경되었습니다.");
        createTranslationKeyIfNotExists("scheduler.task.executed", "scheduler", "작업 실행 성공 메시지", "작업이 실행되었습니다.");
        createTranslationKeyIfNotExists("scheduler.confirm.execute", "scheduler", "즉시 실행 확인 메시지",
                "\"{taskName}\" 작업을 즉시 실행하시겠습니까?");

        // 데이터 그리드 컬럼
        createTranslationKeyIfNotExists("scheduler.column.taskName", "scheduler", "작업 이름 컬럼", "작업 이름");
        createTranslationKeyIfNotExists("scheduler.column.scheduleExpression", "scheduler", "스케줄 표현식 컬럼", "스케줄 표현식");
        createTranslationKeyIfNotExists("scheduler.column.type", "scheduler", "타입 컬럼", "타입");
        createTranslationKeyIfNotExists("scheduler.column.nextExecution", "scheduler", "다음 실행 컬럼", "다음 실행");
        createTranslationKeyIfNotExists("scheduler.column.lastExecution", "scheduler", "마지막 실행 컬럼", "마지막 실행");
        createTranslationKeyIfNotExists("scheduler.column.status", "scheduler", "상태 컬럼", "상태");
        createTranslationKeyIfNotExists("scheduler.column.enabled", "scheduler", "활성화 컬럼", "활성화");
        createTranslationKeyIfNotExists("scheduler.column.actions", "scheduler", "작업 컬럼", "작업");

        // 스케줄 타입 & 단위
        createTranslationKeyIfNotExists("scheduler.type.fixedRate", "scheduler", "Fixed Rate 타입", "Fixed Rate");
        createTranslationKeyIfNotExists("scheduler.type.fixedDelay", "scheduler", "Fixed Delay 타입", "Fixed Delay");
        createTranslationKeyIfNotExists("scheduler.time.seconds", "scheduler", "초 단위", "{seconds}초");
        createTranslationKeyIfNotExists("scheduler.time.minutes", "scheduler", "분 단위", "{minutes}분");
        createTranslationKeyIfNotExists("scheduler.time.hours", "scheduler", "시간 단위", "{hours}시간");
        createTranslationKeyIfNotExists("scheduler.time.days", "scheduler", "일 단위", "{days}일");

        // 버튼 & 툴팁
        createTranslationKeyIfNotExists("scheduler.tooltip.edit", "scheduler", "편집 툴팁", "편집");
        createTranslationKeyIfNotExists("scheduler.tooltip.execute", "scheduler", "즉시 실행 툴팁", "즉시 실행");

        // 스케줄 설정 다이얼로그 (SchedulerConfigDialog.jsx)
        createTranslationKeyIfNotExists("scheduler.dialog.title", "scheduler", "스케줄 설정 다이얼로그 제목", "스케줄 설정 편집");
        createTranslationKeyIfNotExists("scheduler.dialog.taskKey", "scheduler", "작업 키 라벨", "작업 키:");
        createTranslationKeyIfNotExists("scheduler.dialog.scheduleType", "scheduler", "스케줄 타입 라벨", "스케줄 타입:");
        createTranslationKeyIfNotExists("scheduler.dialog.description", "scheduler", "설명 라벨", "설명:");
        createTranslationKeyIfNotExists("scheduler.dialog.cronExpression", "scheduler", "Cron 표현식 필드 라벨", "Cron 표현식");
        createTranslationKeyIfNotExists("scheduler.dialog.cronHelper", "scheduler", "Cron 표현식 도움말",
                "형식: 초 분 시 일 월 요일 (예: 0 0 1 * * *)");
        createTranslationKeyIfNotExists("scheduler.dialog.cronExamples", "scheduler", "Cron 표현식 예시 제목", "Cron 표현식 예시");
        createTranslationKeyIfNotExists("scheduler.dialog.fixedRate", "scheduler", "Fixed Rate 필드 라벨",
                "Fixed Rate (밀리초)");
        createTranslationKeyIfNotExists("scheduler.dialog.fixedDelay", "scheduler", "Fixed Delay 필드 라벨",
                "Fixed Delay (밀리초)");
        createTranslationKeyIfNotExists("scheduler.dialog.currentValue", "scheduler", "현재 값 표시", "현재 값: {value}");
        createTranslationKeyIfNotExists("scheduler.dialog.enabled", "scheduler", "활성화 스위치 라벨", "활성화");
        createTranslationKeyIfNotExists("scheduler.dialog.nextExecution", "scheduler", "다음 실행 예정 메시지",
                "다음 실행 예정: {time}");
        createTranslationKeyIfNotExists("scheduler.dialog.cancel", "scheduler", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("scheduler.dialog.save", "scheduler", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("scheduler.dialog.updated", "scheduler", "설정 업데이트 성공 메시지",
                "스케줄 설정이 업데이트되었습니다.");

        // Cron 예시
        createTranslationKeyIfNotExists("scheduler.cron.every5min", "scheduler", "매 5분마다 Cron 예시", "매 5분마다");
        createTranslationKeyIfNotExists("scheduler.cron.everyHour", "scheduler", "매 시간 정각 Cron 예시", "매 시간 정각");
        createTranslationKeyIfNotExists("scheduler.cron.midnight", "scheduler", "매일 자정 Cron 예시", "매일 자정");
        createTranslationKeyIfNotExists("scheduler.cron.daily1am", "scheduler", "매일 새벽 1시 Cron 예시", "매일 새벽 1시");
        createTranslationKeyIfNotExists("scheduler.cron.weekdays9am", "scheduler", "평일 오전 9시 Cron 예시", "평일 오전 9시");
        createTranslationKeyIfNotExists("scheduler.cron.monday9am", "scheduler", "매주 월요일 오전 9시 Cron 예시",
                "매주 월요일 오전 9시");

        // 에러 메시지
        createTranslationKeyIfNotExists("scheduler.error.cronRequired", "scheduler", "Cron 표현식 필수 에러",
                "Cron 표현식을 입력하세요");
        createTranslationKeyIfNotExists("scheduler.error.cronFormat", "scheduler", "Cron 표현식 형식 에러",
                "Cron 표현식은 6개 필드여야 합니다 (초 분 시 일 월 요일)");
        createTranslationKeyIfNotExists("scheduler.error.fixedRatePositive", "scheduler", "Fixed Rate 양수 에러",
                "Fixed Rate 값은 0보다 커야 합니다");
        createTranslationKeyIfNotExists("scheduler.error.fixedDelayPositive", "scheduler", "Fixed Delay 양수 에러",
                "Fixed Delay 값은 0보다 커야 합니다");
        createTranslationKeyIfNotExists("scheduler.error.updateFailed", "scheduler", "설정 업데이트 실패 에러",
                "스케줄 설정 업데이트에 실패했습니다.");

        // 스케줄러 목록 (SchedulerList.jsx)
        createTranslationKeyIfNotExists("scheduler.list.title", "scheduler", "스케줄된 작업 목록 제목", "스케줄된 작업 목록");
        createTranslationKeyIfNotExists("scheduler.list.lastUpdated", "scheduler", "최근 업데이트 라벨", "최근 업데이트: {time}");
        createTranslationKeyIfNotExists("scheduler.list.retry", "scheduler", "다시 시도 버튼", "다시 시도");
        createTranslationKeyIfNotExists("scheduler.list.totalTasks", "scheduler", "총 스케줄 작업 라벨", "총 스케줄 작업");
        createTranslationKeyIfNotExists("scheduler.list.activeStatus", "scheduler", "활성 상태 라벨", "활성 상태");
        createTranslationKeyIfNotExists("scheduler.list.normalOperation", "scheduler", "정상 동작 상태", "정상 동작");
        createTranslationKeyIfNotExists("scheduler.list.serverTimezone", "scheduler", "서버 시간대 라벨", "서버 시간대");
        createTranslationKeyIfNotExists("scheduler.list.detailsTitle", "scheduler", "스케줄 상세 정보 제목", "스케줄 상세 정보");
        createTranslationKeyIfNotExists("scheduler.list.columnName", "scheduler", "작업 이름 컬럼", "작업 이름");
        createTranslationKeyIfNotExists("scheduler.list.columnSchedule", "scheduler", "스케줄 컬럼", "스케줄");
        createTranslationKeyIfNotExists("scheduler.list.columnType", "scheduler", "타입 컬럼", "타입");
        createTranslationKeyIfNotExists("scheduler.list.columnDescription", "scheduler", "설명 컬럼", "설명");
        createTranslationKeyIfNotExists("scheduler.error.loadFailed", "scheduler", "스케줄러 정보 로딩 실패 에러",
                "스케줄러 정보를 불러오는데 실패했습니다.");

        System.out.println("SchedulerKeysInitializer.initialize() 완료! 스케줄러 키들 초기화됨");
        log.info("스케줄러 번역 키 초기화 완료");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description,
            String defaultValue) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
        if (existingKey.isEmpty()) {
            TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
            translationKeyRepository.save(translationKey);
            log.debug("번역 키 생성: {}", keyName);
        } else {
            log.debug("번역 키 이미 존재: {}", keyName);
        }
    }
}
