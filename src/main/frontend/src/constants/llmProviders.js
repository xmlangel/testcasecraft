// src/constants/llmProviders.js
/**
 * 제공자별 기본값과 안내 문구를 한 곳에 모은다.
 *
 * 이 표가 없을 때는 화면 곳곳에 `formData.provider === "OPENAI" ? … : …` 꼴의 삼항 연쇄가
 * 17곳 있었다. 제공자를 하나 더할 때 그 17곳을 찾아 고쳐야 했고, 실제로 NVIDIA 를 넣을 때
 * 그중 4곳만 고치고 나머지는 다른 제공자용이라 손대지 않았다. 다음 제공자를 넣으면 또 찾아
 * 헤매게 된다.
 *
 * ## 제공자를 더할 때 고쳐야 하는 곳
 *
 * 처음에 "이 표 한 줄과 서버 enum 한 줄" 이라고 적었으나 전수 확인에서 틀린 것으로
 * 드러났다. 실제로는 최소 넷이고, 모델 목록을 지원하면 다섯이다.
 *
 * 1. 이 표 (기본 URL·도움말·예시)
 * 2. 서버의 제공자 enum (`model/LlmConfig.java`)
 * 3. 제공자별 채팅 완성 경로 (`service/llm/LlmApiUrlNormalizer.java` 의 switch)
 * 4. 클라이언트 구현체 (`service/llm/*Client.java`, 기반 클래스를 상속해 훅 넷만 채운다)
 * 5. 모델 목록을 지원하면 카탈로그 구현체 (`service/llm/*ModelCatalogService.java`)
 *
 * 시험은 제공자 목록을 데이터로 받으므로 자동으로 늘어난다.
 *
 * ## apiUrl 에 호스트만 두는 이유
 *
 * 서버가 등록된 URL 뒤에 자기 호출 경로를 붙인다. 제공자 공식 문서는 대개 경로가 포함된
 * 형태를 base URL 로 안내하는데(OpenRouter 는 `/api/v1`, OpenAI 는 `/v1`), 그 값을 그대로
 * 넣으면 경로가 두 번 붙어 404 가 났다. 서버 쪽 정규화가 어느 형태든 받아 주지만, 처음부터
 * 올바른 값을 채워 두면 사용자가 문서를 보고 경로를 덧붙이는 일 자체가 줄어든다.
 */

/**
 * 제공자 정의.
 *
 * @property {string} label 화면에 보이는 이름
 * @property {string} apiUrl 기본 API URL (호스트만)
 * @property {string} apiUrlHint API URL 칸의 도움말
 * @property {string} apiUrlHintKey 도움말 번역 키
 * @property {string} modelPlaceholder 모델 칸의 예시
 * @property {string} modelHint 모델 칸의 도움말
 * @property {string} modelHintKey 도움말 번역 키
 */
export const LLM_PROVIDERS = {
  OPENWEBUI: {
    label: "OpenWebUI",
    apiUrl: "http://localhost:3000",
    apiUrlHintKey: "admin.llmConfig.apiUrlHelperOpenwebui",
    apiUrlHint:
      "Docker 환경: http://host.docker.internal:3000 | 로컬: http://localhost:3000",
    modelPlaceholder: "llama3.1",
    modelHintKey: "admin.llmConfig.modelHelperOpenwebui",
    modelHint: "예시: llama3.1, granite3.1-dense:8b",
  },
  OPENAI: {
    label: "OpenAI",
    apiUrl: "https://api.openai.com",
    apiUrlHintKey: "admin.llmConfig.apiUrlHelperOpenai",
    apiUrlHint: "기본 URL: https://api.openai.com",
    modelPlaceholder: "gpt-4",
    modelHintKey: "admin.llmConfig.modelHelperOpenai",
    modelHint: "예시: gpt-4, gpt-3.5-turbo, gpt-4-turbo",
  },
  OLLAMA: {
    label: "Ollama",
    apiUrl: "http://localhost:11434",
    apiUrlHintKey: "admin.llmConfig.apiUrlHelperOllama",
    apiUrlHint:
      "Docker 환경: http://host.docker.internal:11434 | 로컬: http://localhost:11434",
    modelPlaceholder: "qwen2.5-coder:7b",
    modelHintKey: "admin.llmConfig.modelHelperOllama",
    modelHint:
      "예시: qwen2.5-coder:7b, llama3.1:8b, mistral:7b, deepseek-coder:6.7b",
  },
  PERPLEXITY: {
    label: "Perplexity",
    apiUrl: "https://api.perplexity.ai",
    apiUrlHintKey: "admin.llmConfig.apiUrlHelperPerplexity",
    apiUrlHint: "기본 URL: https://api.perplexity.ai",
    modelPlaceholder: "llama-3.1-sonar-large-128k-online",
    modelHintKey: "admin.llmConfig.modelHelperPerplexity",
    modelHint:
      "예시: llama-3.1-sonar-large-128k-online, llama-3.1-sonar-small-128k-online",
  },
  OPENROUTER: {
    label: "OpenRouter",
    apiUrl: "https://openrouter.ai",
    apiUrlHintKey: "admin.llmConfig.apiUrlHelperOpenrouter",
    apiUrlHint: "기본 URL: https://openrouter.ai",
    modelPlaceholder: "nvidia/nemotron-3-nano-30b-a3b:free",
    modelHintKey: "admin.llmConfig.models.helper",
    modelHint:
      "목록은 무료 모델입니다. 유료 모델은 슬러그를 직접 입력하세요 (예: anthropic/claude-sonnet-5).",
  },
  NVIDIA: {
    label: "NVIDIA",
    apiUrl: "https://integrate.api.nvidia.com",
    apiUrlHintKey: "admin.llmConfig.apiUrlHelperNvidia",
    apiUrlHint: "기본 URL: https://integrate.api.nvidia.com",
    modelPlaceholder: "meta/llama-3.1-8b-instruct",
    modelHintKey: "admin.llmConfig.models.helperNvidia",
    modelHint:
      "목록에는 계정에서 제공하지 않는 모델도 섞여 있습니다. '전수 확인' 으로 쓸 수 있는 것만 남기세요.",
  },
};

/** 제공자 선택 목록에 쓸 순서. 화면에 보이는 순서를 여기서 정한다. */
export const LLM_PROVIDER_ORDER = [
  "OPENWEBUI",
  "OPENAI",
  "OLLAMA",
  "PERPLEXITY",
  "OPENROUTER",
  "NVIDIA",
];

/** 모르는 제공자가 와도 화면이 깨지지 않게 하는 기본값. */
const FALLBACK = {
  label: "",
  apiUrl: "",
  apiUrlHintKey: "",
  apiUrlHint: "",
  modelPlaceholder: "",
  modelHintKey: "",
  modelHint: "",
};

/** 제공자 정의. 모르는 값이면 빈 정의를 준다. */
export const providerInfo = (provider) => LLM_PROVIDERS[provider] || FALLBACK;

/** 제공자별 기본 API URL 목록. 사용자가 값을 고쳤는지 판단할 때 쓴다. */
export const DEFAULT_API_URLS = Object.values(LLM_PROVIDERS).map(
  (p) => p.apiUrl,
);

/**
 * 어느 제공자의 기본값과도 다르면 사용자가 직접 고친 값으로 본다.
 *
 * 제공자를 바꿀 때 이 판정으로 덮어쓸지 정한다. 사설 호스트를 입력해 둔 사용자가 제공자를
 * 잠깐 바꿨다 돌아왔을 때 값을 잃으면 안 된다.
 */
export const isUntouchedApiUrl = (apiUrl) =>
  !apiUrl || DEFAULT_API_URLS.includes(apiUrl);
