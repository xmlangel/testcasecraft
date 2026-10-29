package com.testcase.testcasemanagement.security;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.service.MailService;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.testng.annotations.Test;

/**
 * ICT-443: 범용 메일 발송 API(POST /api/mail/send)가 다시 생기지 않는지 확인한다.
 *
 * <p>그 API 는 테스터 권한만으로 요청 본문의 발신자를 그대로 써서 회사 SMTP 로 메일을 보냈다. 컨트롤러 전체의 요청 매핑을 모아 같은 경로가 없는지 보고, 발신자를
 * 호출자가 정하는 서비스 메서드가 남아 있지 않은지 본다.
 */
public class MailSendEndpointRemovedTest {

  private static final String BASE_PACKAGE = "com.testcase.testcasemanagement";
  private static final String REMOVED_PATH = "/api/mail/send";

  @Test
  public void noControllerMapsMailSendPath() throws ClassNotFoundException {
    List<String> paths = collectMappedPaths();

    assertFalse(paths.isEmpty(), "컨트롤러 매핑을 하나도 찾지 못했다. 스캔 범위가 틀렸다");
    assertFalse(paths.contains(REMOVED_PATH), REMOVED_PATH + " 가 다시 매핑되어 있다: ICT-443 회귀");
  }

  @Test
  public void mailServiceDoesNotLetCallerChooseSender() {
    for (Method method : MailService.class.getDeclaredMethods()) {
      if (!Modifier.isPublic(method.getModifiers())) {
        continue;
      }
      assertFalse(
          method.getName().contains("CustomSender") || method.getName().contains("Html"),
          "발신자를 지정하는 메서드가 남아 있다: " + method.getName());
      // 남은 발송 메서드는 (수신자, 제목, 본문) 셋만 받는다. 발신자 인자가 붙으면 개수가 늘어난다.
      if (method.getName().startsWith("send")) {
        assertEquals(method.getParameterCount(), 3, "예상 밖의 발송 메서드 시그니처: " + method);
      }
    }
  }

  private static List<String> collectMappedPaths() throws ClassNotFoundException {
    ClassPathScanningCandidateComponentProvider scanner =
        new ClassPathScanningCandidateComponentProvider(false);
    scanner.addIncludeFilter(new AnnotationTypeFilter(Controller.class));

    List<String> paths = new ArrayList<>();
    for (BeanDefinition definition : scanner.findCandidateComponents(BASE_PACKAGE)) {
      Class<?> type =
          Class.forName(
              definition.getBeanClassName(),
              false,
              MailSendEndpointRemovedTest.class.getClassLoader());
      List<String> prefixes =
          mappingPaths(AnnotatedElementUtils.findMergedAnnotation(type, RequestMapping.class));
      for (Method method : type.getDeclaredMethods()) {
        RequestMapping mapping =
            AnnotatedElementUtils.findMergedAnnotation(method, RequestMapping.class);
        if (mapping == null) {
          continue;
        }
        for (String prefix : prefixes) {
          for (String suffix : mappingPaths(mapping)) {
            paths.add(join(prefix, suffix));
          }
        }
      }
    }
    assertTrue(paths.stream().anyMatch(p -> p.startsWith("/api/")), "/api/ 매핑이 없다: 스캔 실패");
    return paths;
  }

  private static List<String> mappingPaths(RequestMapping mapping) {
    List<String> result = new ArrayList<>();
    if (mapping != null) {
      result.addAll(List.of(mapping.path()));
      result.addAll(List.of(mapping.value()));
    }
    if (result.isEmpty()) {
      result.add("");
    }
    return result;
  }

  private static String join(String prefix, String suffix) {
    String joined = ("/" + prefix + "/" + suffix).replaceAll("/+", "/");
    return joined.length() > 1 && joined.endsWith("/")
        ? joined.substring(0, joined.length() - 1)
        : joined;
  }
}
