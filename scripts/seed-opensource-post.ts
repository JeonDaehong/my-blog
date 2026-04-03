import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 카테고리 생성 (없으면)
  const category = await prisma.category.upsert({
    where: { slug: "opensource" },
    update: {},
    create: {
      name: "오픈소스기여",
      nameEn: "Open Source",
      slug: "opensource",
      description: "오픈소스 기여 경험과 이야기",
      descriptionEn: "Open source contribution experiences and stories",
      order: 4,
    },
  });

  const content = `# 1. 서론

개발자로서 오픈소스에 기여하는 건 언젠가 꼭 해보고 싶은 목표 중 하나였다. 근데 막상 시도하려니까 어디서부터 시작해야 할지 도무지 감이 안 왔다.

그러다 오픈소스 기여를 안내해주는 커뮤니티를 알게 됐고, 멘토링 프로그램에 참여하면서 본격적으로 발을 들이게 됐다. 이슈를 찾고, 기여할 부분을 고민하며, 어영부영 오픈소스의 세계에 입문했다.

Kafka를 공부하던 중 Spring Kafka 내부 구현이 문득 궁금해졌고, GitHub 저장소를 뒤적거리다가 하나의 이슈를 발견했다. 작아 보이지만 사용자에게 혼란을 줄 수 있는 문제. 그걸 계기로 생애 첫 Pull Request를 만들었고, 운 좋게도 머지되면서 Spring Kafka의 공식 Contributor가 됐다.

이 글에서는 그 여정을 정리해보려 한다. 오픈소스 기여가 막연하게 느껴지는 분들께 조금이나마 참고가 되면 좋겠다.

---

# 2. 본론

## 2.1. 이슈 선택 과정

이슈를 고를 때 가장 신경 쓴 건 두 가지였다. **기여 난이도가 적당한가?** 그리고 **프로젝트 소스를 깊이 이해하지 않아도 수정할 수 있는가?**

솔직히 처음에는 뭘 해야 할지 전혀 몰랐다. 어떤 프로젝트가 초보자한테 맞는지, 어떤 이슈를 잡아야 하는지 감이 하나도 안 왔다. 그래서 멘토링 프로그램에서 조언을 구했고, 나름의 기준을 세웠다.

### 프로젝트 선택 기준

1. **업무에서 써본 기술 스택**: 완전히 모르는 기술보다는 어느 정도 익숙한 영역
2. **활발한 커뮤니티**: 이슈와 PR이 꾸준히 올라오고, 메인테이너들이 반응이 빠른 곳
3. **기여 가이드라인이 잘 정리된 프로젝트**: CONTRIBUTING.md가 있고 코딩 스타일이 명시된 곳
4. **Good First Issue 라벨**: 초보자용 이슈가 따로 분류돼 있는 곳

이런 기준으로 Apache, Spring 등 여러 저장소를 둘러봤다.

처음에는 Apache Jackrabbit Oak에서 기여할 만한 이슈를 찾았는데, 이건 결과적으로 머지되지 못했다. (자세한 건 뒤에서.) 그래서 다시 이슈를 찾아 나섰고, Spring-Kafka에서 [KafkaTemplate Bean 이름 불일치 이슈](https://github.com/spring-projects/spring-kafka/issues/3514)를 발견하게 됐다.

---

## 2.2. 이슈 발견: KafkaTemplate Bean 이름 불일치

Spring Kafka를 공부하면서 \`@RetryableTopic\` 어노테이션을 알게 됐는데, 이게 꽤 유용한 기능이었다. 메시지 처리가 실패하면 자동으로 재시도 토픽으로 보내주는 건데, 실무에서도 충분히 쓸 만해 보였다.

그런데 문서를 읽다가 뭔가 이상한 점을 발견했다. Spring Kafka 공식 문서에서는 \`@RetryableTopic\`이 기본으로 사용하는 **KafkaTemplate** 빈 이름을 \`defaultRetryTopicKafkaTemplate\`이라고 적어놨다.

근데 실제 \`@RetryableTopic\`의 JavaDoc을 보니 다른 이름이 적혀 있었다.

\`\`\`java
/**
 * The bean name of the KafkaTemplate bean that will be used to forward
 * the message to the retry and Dlt topics. If not specified,
 * a bean with name retryTopicDefaultKafkaTemplate or kafkaTemplate
 * will be looked up.
 */
\`\`\`

JavaDoc에는 \`retryTopicDefaultKafkaTemplate\`, 공식 문서에는 \`defaultRetryTopicKafkaTemplate\`. 테스트 코드 일부도 JavaDoc 쪽 이름을 따라가고 있었다.

처음엔 "내가 잘못 본 건가?" 싶어서 몇 번이나 다시 확인했는데, 분명히 불일치가 있었다. 이러면 개발자들이 빈 이름을 뭘 써야 할지 헷갈릴 수밖에 없다.

![Spring Kafka GitHub Issue 화면](/spring-kafka-github-issue.png)

> 해당 이슈는 Spring Kafka GitHub Issue #3514에서 논의되었다.

### 실제 구현 코드 분석

궁금해서 소스 코드를 더 파봤다. \`RetryTopicBeanNames\` 클래스를 확인해보니:

\`\`\`java
public final class RetryTopicBeanNames {
    public static final String DEFAULT_KAFKA_TEMPLATE_BEAN_NAME =
        "defaultRetryTopicKafkaTemplate";
    // ...
}
\`\`\`

실제 구현에서는 \`defaultRetryTopicKafkaTemplate\`을 쓰고 있었다. JavaDoc과 일부 테스트만 \`retryTopicDefaultKafkaTemplate\`을 참조하고 있었던 거다.

이런 불일치는 특히 Spring Kafka를 처음 쓰는 사람한테 문제가 될 수 있겠다 싶어서 고쳐보기로 했다.

---

## 2.3. 해결 과정 1: JavaDoc 정정

가장 명확한 부분부터 손댔다. \`@RetryableTopic\` 어노테이션의 JavaDoc을 실제 구현과 일치하게 수정하는 것.

**수정 전:**

\`\`\`java
/**
 * ... a bean with name retryTopicDefaultKafkaTemplate or kafkaTemplate
 * will be looked up.
 */
\`\`\`

**수정 후:**

\`\`\`java
/**
 * ... a bean with name defaultRetryTopicKafkaTemplate or kafkaTemplate
 * will be looked up.
 */
\`\`\`

변경 자체는 단순하지만, JavaDoc은 IDE에서 자동완성이나 도움말을 볼 때 가장 먼저 참조하는 정보다. 여기가 틀려있으면 개발자가 잘못된 빈 이름을 쓰게 될 수 있다.

> Commit Message: Fix: Replace retryTopicDefaultKafkaTemplate with defaultRetryTopicKafkaTemplate in docs

---

## 2.4. 해결 과정 2: 테스트 코드 리팩터링

JavaDoc만 고치는 건 부족하다고 생각했다. 테스트 코드에서도 같은 문제가 있었다. \`RetryTopicConfigurationProviderTests\`를 보니, 빈 이름을 하드코딩된 문자열로 직접 박아놨다.

**수정 전:**

\`\`\`java
willReturn(kafkaOperations).given(beanFactory)
    .getBean("retryTopicDefaultKafkaTemplate", KafkaOperations.class);
\`\`\`

**수정 후:**

\`\`\`java
willReturn(kafkaOperations).given(beanFactory)
    .getBean(RetryTopicBeanNames.DEFAULT_KAFKA_TEMPLATE_BEAN_NAME,
             KafkaOperations.class);
\`\`\`

이 수정이 중요한 이유는 두 가지다:

1. **일관성**: 하드코딩된 문자열 대신 상수를 쓰면 코드 전체의 일관성이 올라간다.
2. **유지보수성**: 나중에 빈 이름이 바뀌더라도 상수 하나만 고치면 된다.

> Commit Message: Fix: Replace retryTopicDefaultKafkaTemplate with RetryTopicBeanNames.DEFAULT_KAFKA_TEMPLATE_BEAN_NAME in Test Code

---

## 2.5. PR 작성과 리뷰 과정

코드를 고치고 나서 제일 긴장되는 순간이 왔다. PR 작성. 첫 오픈소스 기여라 손이 떨렸다.

### PR 제목과 설명

제목은 간결하게:
**"GH-3514: Change default template bean name from retryTopicDefaultKafkaTemplate to defaultRetryTopicKafkaTemplate"**

설명에는 이런 내용을 넣었다:

1. 왜 이 수정이 필요한지
2. 구체적으로 뭘 바꿨는지
3. 기존 테스트 통과 여부
4. 관련 이슈 링크

### 메인테이너와의 소통

PR을 올리고 며칠 후 메인테이너가 리뷰를 남겨줬다. 다행히 긍정적인 피드백이었고, 몇 가지 수정 요청이 있었다:

1. Spring 프로젝트의 커밋 메시지 컨벤션에 맞게 조정
2. 변경사항 확인을 위한 테스트 케이스 추가

이런 피드백을 받으면서 오픈소스 프로젝트마다 고유한 문화와 규칙이 있다는 걸 체감했다.

![PR 코드 변경 사항](/spring-kafka-pr-code-diff.png)

> 실제 코드 변경 사항을 보여주는 GitHub diff 화면

![PR 머지된 모습](/spring-kafka-pr.png)

> PR이 성공적으로 머지됐다!

![Spring Kafka Contributor 뱃지](/spring-kafka-contributor-badge.png)

> Spring Kafka Contributor가 되었다.

### 머지 성공

리뷰 피드백을 반영하고 며칠 후 드디어 PR이 머지됐다. Spring Kafka의 공식 Contributor라니. 작은 변경이었지만, 전 세계 개발자들이 쓰는 라이브러리에 내 코드가 들어갔다는 게 묘한 기분이었다.

자세한 PR 내용은 [Spring Kafka PR #3543](https://github.com/spring-projects/spring-kafka/pull/3543)에서 볼 수 있다.

---

## 2.6. 실패에서 배운 것: Apache Jackrabbit Oak

사실 Spring Kafka 기여 전에 한 번 실패한 적이 있다. Apache Jackrabbit Oak에서 시도했던 기여가 머지되지 못했다. 근데 이 실패가 오히려 더 큰 배움을 줬다.

### Apache Jackrabbit Oak이 뭔가

처음 들어보는 분이 많을 텐데, 간단히 말하면 파일이나 문서를 트리 구조로 저장하고 관리해주는 시스템이다. Java로 만들어졌고, Adobe Experience Manager(AEM) 같은 콘텐츠 관리 시스템에서 내부 저장소로 쓰인다.

웹사이트에서 페이지를 만들거나 이미지를 올릴 때 그 데이터를 저장하는 데 Oak이 쓰일 수 있다. 파일을 디렉토리처럼 관리하고 변경 이력도 남기는 구조라 CMS에 잘 맞는다.

### 발견한 이슈와 해결 시도

발견한 이슈는 코드 중복 문제였다.

![Apache Jackrabbit Oak 코드 중복 이슈](/apache-jackrabbit-oak-issue.png)

\`MAX_SEGMENT_SIZE\` 상수가 **Segment** 클래스와 **SegmentDataUtils** 클래스에 중복으로 정의돼 있었다. 같은 값(\`1 << 18\`)을 두 곳에서 따로 관리하고 있었던 거다.

해결 방법은 간단했다:

1. **Segment** 클래스의 \`MAX_SEGMENT_SIZE\`에 \`public\` 접근 제어자 추가
2. **SegmentDataUtils**에서 중복 정의 제거하고 \`Segment.MAX_SEGMENT_SIZE\` 참조

자신 있게 PR을 올렸다.

![코드 변경사항](/apache-oak-pr-code-changes.png)

![PR 화면](/apache-oak-pr.png)

### 결과는 머지 실패

근데 결과는 Close였다. 솔직히 당황스러웠다.

![PR이 닫힌 모습](/apache-oak-pr-closed.png)

이유는 의외로 단순했다. **이미 다른 사람이 먼저 같은 내용으로 PR을 올린 상태**였다. 내가 PR을 올리기 몇 시간 전에 다른 기여자가 같은 수정을 먼저 제출했고, 그 PR이 먼저 리뷰되고 머지된 거였다.

처음엔 좀 억울했다. "내가 먼저 발견했는데!" 싶기도 했다. 근데 시간이 지나면서 이 경험이 오히려 값진 교훈이라는 걸 깨달았다.

### 실패에서 얻은 교훈

**1. 이슈 상태를 꼼꼼히 확인해야 한다**

오픈소스에서는 이슈가 해결돼도 바로 Close되지 않는 경우가 많다. 이슈를 잡기 전에 확인할 것들:

- 최근 댓글이나 활동이 있는지
- 누군가 이미 작업 중이라고 언급했는지
- 관련 PR이 이미 올라와 있는지

**2. 이슈 선점 에티켓**

누군가 해당 이슈를 해결하겠다고 Assign을 받았거나 댓글로 의사를 밝혔다면, 그걸 존중해야 한다. 강제되는 건 아니지만 커뮤니티 문화를 지키는 게 중요하다.

**3. 올바른 기여 프로세스**

1. 이슈에 댓글로 해결 의사를 먼저 밝히기
2. 다른 사람이 이미 진행 중인지 확인하기
3. 오랫동안 멈춰있는 이슈라면 정중하게 문의하기
4. 메인테이너나 다른 기여자들과 소통하기

예를 들면 이런 식으로:

\`\`\`
Hi! I'd like to work on this issue.
Could you please assign it to me?
I plan to submit a PR within a few days.

If anyone is already working on this, please let me know!
\`\`\`

**4. 실패도 과정이다**

만약 이 PR이 성공했더라면 오픈소스 기여가 쉽다고 착각했을 수도 있다. 실패를 통해 커뮤니티의 문화와 프로세스를 배웠고, Spring Kafka 기여에서는 더 꼼꼼하게 준비할 수 있었다.

---

## 2.7. 기여 이후 달라진 것들

### 자신감

가장 큰 변화다. "나도 할 수 있구나"라는 확신이 생겼다. 쉽다는 건 아니지만 체계적으로 접근하면 충분히 가능하다는 걸 알게 됐다.

### 코드 품질에 대한 기준

메인테이너의 꼼꼼한 리뷰를 받으면서, 단순히 돌아가는 코드가 아니라 읽기 쉽고 유지보수하기 좋은 코드의 중요성을 몸으로 느꼈다. 회사에서 코드를 짤 때도 네이밍, 문서화, 테스트, 코드 리뷰를 더 신경 쓰게 됐다.

### 오픈소스 생태계에 대한 이해

오픈소스가 어떻게 운영되는지, 메인테이너들이 얼마나 많은 시간과 노력을 쏟는지 알게 됐다. 우리가 당연하게 쓰는 라이브러리와 프레임워크가 다 누군가의 기여로 만들어진 거라는 걸 실감했다.

---

# 3. 결론

이번 Spring Kafka 기여로 문서와 코드의 불일치 문제를 고치며, 라이브러리 사용자들이 덜 헷갈리게 만드는 데 조금이나마 보탬이 됐다.

작고 사소한 변경처럼 보일 수 있지만, 실제로 개발자 경험에 직접적으로 영향을 주는 부분이라 의미가 있었다고 생각한다. 무엇보다 오픈소스 생태계의 문화, 프로세스, 협업 방식을 직접 체험한 게 가장 큰 수확이었다.

---

## 오픈소스 기여를 망설이는 분들에게

내 경험을 통해 하고 싶은 말은, **완벽하게 아는 상태에서 시작하는 사람은 없다**는 거다. 나도 문서 하나 고치고, 테스트 코드 한 줄 바꾸는 데서 시작했다.

작은 기여도 충분히 의미 있고, 오픈소스 커뮤니티는 그런 기여를 소중히 여긴다. 거창한 기능을 추가하는 게 아니라, 문제를 발견하고 해결하려는 마음가짐이 중요하다.

### 실전 조언 몇 가지

1. **Good First Issue부터**: 대부분의 프로젝트에서 초보자용 이슈를 따로 분류해 놨다.
2. **문서 오타나 개선도 훌륭한 기여다**: 코드를 못 짠다고 기여 못하는 게 아니다.
3. **이슈에 먼저 댓글 남기기**: 작업 의사를 미리 밝히면 중복 작업을 피할 수 있다.
4. **작은 변경이라도 테스트 확인**: 기존 테스트가 다 통과하는지 반드시 확인.
5. **커밋 메시지는 명확하게**: 나중에 히스토리 볼 때 이해하기 쉽게.
6. **실패를 두려워하지 말 것**: 나도 실패했지만, 그 경험이 더 큰 성공으로 이어졌다.

---

## 마무리

> 중요한 건 완벽함이 아니라 시작이다. 지금 여러분도 첫 발을 내디뎌보자.

오픈소스는 전 세계 개발자들이 함께 만들어가는 공동체다. 여러분의 기여 하나하나가 모여서 더 나은 소프트웨어를 만든다.

첫 PR을 두려워하지 말자. 모든 전문가도 처음에는 초보자였으니까.

나도 이제 막 시작한 단계지만, 앞으로도 꾸준히 기여하면서 성장해나가고 싶다. 그리고 언젠가는 다른 초보자에게 도움을 줄 수 있는 사람이 되고 싶다.

용기를 내서 첫 기여를 시작해보자. 분명 뿌듯하고 의미 있는 경험이 될 거다.`;

  const contentEn = `# 1. Introduction

Contributing to open source was always on my bucket list as a developer. But when I actually tried, I had no idea where to start.

Then I found a community that guides open source contributions, joined their mentoring program, and started diving in. Finding issues, thinking about what to contribute — that's how I stumbled into the world of open source.

While studying Kafka, I got curious about Spring Kafka's internals and started browsing the GitHub repo. There I found an issue — small but potentially confusing for users. That became my very first Pull Request, and fortunately it got merged, making me an official Spring Kafka Contributor.

This post covers that journey. Hope it helps anyone who finds open source contribution intimidating.

---

# 2. Main Content

## 2.1. Choosing an Issue

The two things I cared about most when picking an issue: **Is the contribution difficulty reasonable?** and **Can I fix it without deeply understanding the entire project?**

Honestly, I had zero clue at first. Which project suits a beginner? What kind of issue should I pick? So I asked for advice in the mentoring program and set up my own criteria.

### Project Selection Criteria

1. **Familiar tech stack**: Something I'd used at work rather than completely unknown territory
2. **Active community**: Consistent issues and PRs, responsive maintainers
3. **Clear contribution guidelines**: Well-written CONTRIBUTING.md with defined coding styles
4. **Good First Issue labels**: Issues specifically categorized for beginners

With these criteria, I browsed several repositories including Apache and Spring projects.

I first found a viable issue in Apache Jackrabbit Oak, but that PR didn't get merged. (More on that later.) So I went looking again, and found a [KafkaTemplate Bean naming inconsistency](https://github.com/spring-projects/spring-kafka/issues/3514) in Spring-Kafka.

---

## 2.2. The Issue: KafkaTemplate Bean Name Mismatch

While studying Spring Kafka, I learned about the \`@RetryableTopic\` annotation — a pretty useful feature. It automatically routes failed messages to retry topics, and it seemed practical enough for production use.

But while reading the docs, I noticed something odd. The official Spring Kafka documentation stated that \`@RetryableTopic\` uses a default **KafkaTemplate** bean named \`defaultRetryTopicKafkaTemplate\`.

However, the actual JavaDoc for \`@RetryableTopic\` said something different:

\`\`\`java
/**
 * The bean name of the KafkaTemplate bean that will be used to forward
 * the message to the retry and Dlt topics. If not specified,
 * a bean with name retryTopicDefaultKafkaTemplate or kafkaTemplate
 * will be looked up.
 */
\`\`\`

JavaDoc says \`retryTopicDefaultKafkaTemplate\`, official docs say \`defaultRetryTopicKafkaTemplate\`. Some test code followed the JavaDoc version too.

I double-checked multiple times thinking I might be wrong, but the inconsistency was real. This would definitely confuse developers about which bean name to use.

![Spring Kafka GitHub Issue](/spring-kafka-github-issue.png)

> This was discussed in Spring Kafka GitHub Issue #3514.

### Analyzing the Implementation

Digging deeper into the source, I checked the \`RetryTopicBeanNames\` class:

\`\`\`java
public final class RetryTopicBeanNames {
    public static final String DEFAULT_KAFKA_TEMPLATE_BEAN_NAME =
        "defaultRetryTopicKafkaTemplate";
    // ...
}
\`\`\`

The actual implementation used \`defaultRetryTopicKafkaTemplate\`. Only the JavaDoc and some tests referenced \`retryTopicDefaultKafkaTemplate\`.

This kind of mismatch is especially problematic for people new to Spring Kafka. So I decided to fix it.

---

## 2.3. Fix 1: Correcting the JavaDoc

I started with the most obvious part — updating the \`@RetryableTopic\` annotation's JavaDoc to match the actual implementation.

**Before:**

\`\`\`java
/**
 * ... a bean with name retryTopicDefaultKafkaTemplate or kafkaTemplate
 * will be looked up.
 */
\`\`\`

**After:**

\`\`\`java
/**
 * ... a bean with name defaultRetryTopicKafkaTemplate or kafkaTemplate
 * will be looked up.
 */
\`\`\`

Simple change, but JavaDoc is the first reference developers see in IDE autocomplete and tooltips. If it's wrong, developers end up using the wrong bean name.

---

## 2.4. Fix 2: Test Code Refactoring

Fixing just the JavaDoc wasn't enough. The test code had the same problem. \`RetryTopicConfigurationProviderTests\` had the bean name hardcoded as a string literal.

**Before:**

\`\`\`java
willReturn(kafkaOperations).given(beanFactory)
    .getBean("retryTopicDefaultKafkaTemplate", KafkaOperations.class);
\`\`\`

**After:**

\`\`\`java
willReturn(kafkaOperations).given(beanFactory)
    .getBean(RetryTopicBeanNames.DEFAULT_KAFKA_TEMPLATE_BEAN_NAME,
             KafkaOperations.class);
\`\`\`

Two reasons this matters:

1. **Consistency**: Using constants instead of hardcoded strings improves codebase consistency.
2. **Maintainability**: If the bean name ever changes, you only need to update one constant.

---

## 2.5. PR and Review Process

After the fixes, came the most nerve-wracking part: writing the PR. My hands were literally shaking — first open source contribution and all.

### PR Title and Description

Title: **"GH-3514: Change default template bean name from retryTopicDefaultKafkaTemplate to defaultRetryTopicKafkaTemplate"**

The description included:

1. Why this fix was needed
2. What specifically changed
3. Test pass confirmation
4. Related issue link

### Communication with Maintainers

A few days after submitting, a maintainer left a review. Fortunately positive, with a couple of adjustment requests:

1. Align commit messages with Spring project conventions
2. Add test cases to verify the changes

Getting this feedback made me realize every open source project has its own culture and rules.

![PR Code Changes](/spring-kafka-pr-code-diff.png)

![PR Merged](/spring-kafka-pr.png)

![Spring Kafka Contributor Badge](/spring-kafka-contributor-badge.png)

### Merged!

After addressing the review feedback, the PR got merged a few days later. An official Spring Kafka Contributor. A small change, but knowing my code is part of a library used by developers worldwide felt surreal.

Full PR details at [Spring Kafka PR #3543](https://github.com/spring-projects/spring-kafka/pull/3543).

---

## 2.6. Lessons from Failure: Apache Jackrabbit Oak

Before the Spring Kafka success, I had a failed attempt. My contribution to Apache Jackrabbit Oak didn't get merged. But this failure taught me more than the success did.

### What is Apache Jackrabbit Oak?

In short, it's a system that stores and manages files and documents in a tree structure. Built in Java, it's used as the internal repository for content management systems like Adobe Experience Manager (AEM).

### The Issue and My Attempt

I found a code duplication issue.

![Apache Jackrabbit Oak Issue](/apache-jackrabbit-oak-issue.png)

The \`MAX_SEGMENT_SIZE\` constant was defined in both the **Segment** class and **SegmentDataUtils** class. Same value (\`1 << 18\`), maintained separately in two places.

The fix was straightforward:

1. Add \`public\` modifier to **Segment**'s \`MAX_SEGMENT_SIZE\`
2. Remove the duplicate in **SegmentDataUtils** and reference \`Segment.MAX_SEGMENT_SIZE\`

Submitted the PR confidently.

![Code Changes](/apache-oak-pr-code-changes.png)

![PR](/apache-oak-pr.png)

### Result: Closed

But the PR got closed. I was genuinely surprised.

![PR Closed](/apache-oak-pr-closed.png)

The reason was unexpectedly simple: **someone else had already submitted the same fix hours before me**. Their PR was reviewed and merged first.

At first I felt frustrated. But over time I realized this was actually a valuable lesson.

### What I Learned

**1. Always check issue status thoroughly**

In open source, issues often stay open even after they're resolved. Before picking an issue, check:

- Recent comments or activity
- Whether someone has already claimed it
- Whether a related PR already exists

**2. Issue claiming etiquette**

If someone has been assigned or has commented that they're working on it, respect that. It's not enforced, but it's important for community health.

**3. The right contribution process**

1. Comment on the issue first to express intent
2. Check if someone is already working on it
3. If an issue has been stalled, ask politely
4. Communicate with maintainers and other contributors

**4. Failure is part of the process**

If this PR had succeeded, I might have underestimated open source contribution. Through failure, I learned the community's culture and processes, which made me better prepared for the Spring Kafka contribution.

---

## 2.7. What Changed After Contributing

### Confidence

The biggest change. Knowing "I can do this" makes a real difference. It's not easy, but it's doable with a systematic approach.

### Higher Standards for Code Quality

Getting thorough reviews from maintainers drove home the importance of readable, maintainable code — not just code that works. Now I pay more attention to naming, documentation, testing, and code review at work too.

### Understanding the Open Source Ecosystem

I gained appreciation for how open source projects run and how much effort maintainers put in. The libraries and frameworks we take for granted are all built on someone's contributions.

---

# 3. Conclusion

Through this Spring Kafka contribution, I fixed an inconsistency between documentation and code, hopefully saving some developers from confusion.

It might seem like a small change, but it directly affects developer experience, and that matters. More importantly, experiencing the culture, processes, and collaboration of the open source ecosystem firsthand was the real reward.

---

## For Those Hesitant About Open Source

What I want to say is: **nobody starts knowing everything**. I started by fixing one doc and changing one line of test code.

Small contributions are meaningful, and the open source community values them. It's not about adding big features — it's about the willingness to find and fix problems.

### Practical Tips

1. **Start with Good First Issues**: Most projects categorize beginner-friendly issues separately.
2. **Doc fixes count**: You don't need to write code to contribute meaningfully.
3. **Comment on the issue first**: Claiming work upfront prevents duplicate effort.
4. **Always run tests**: Even for small changes, verify all existing tests pass.
5. **Write clear commit messages**: Make history readable for future you.
6. **Don't fear failure**: I failed too, and that failure led to a bigger success.

---

## Final Thoughts

> What matters isn't perfection — it's starting.

Open source is a community built by developers worldwide. Each contribution adds up to better software.

Don't be afraid of your first PR. Every expert was once a beginner.

I'm just getting started myself, but I want to keep contributing and growing. And someday, I hope to help other beginners the way I was helped.

Take the leap. It'll be worth it.`;

  // 포스트 생성
  const post = await prisma.post.upsert({
    where: { slug: "spring-kafka-opensource-contribution" },
    update: {
      title: "오픈소스 기여의 첫 발자국, 실패와 성공의 과정",
      titleEn: "First Steps in Open Source: A Story of Failure and Success",
      content,
      contentEn,
      excerpt: "Spring Kafka의 RetryTopic Bean 이름 불일치 문제를 발견하고 해결한 첫 오픈소스 기여 경험을 공유합니다.",
      excerptEn: "Sharing my first open source contribution experience — finding and fixing a RetryTopic Bean naming inconsistency in Spring Kafka.",
      coverImage: "/kafka-retrytopic-new-thumbnail.png",
      published: true,
      categoryId: category.id,
    },
    create: {
      title: "오픈소스 기여의 첫 발자국, 실패와 성공의 과정",
      titleEn: "First Steps in Open Source: A Story of Failure and Success",
      slug: "spring-kafka-opensource-contribution",
      content,
      contentEn,
      excerpt: "Spring Kafka의 RetryTopic Bean 이름 불일치 문제를 발견하고 해결한 첫 오픈소스 기여 경험을 공유합니다.",
      excerptEn: "Sharing my first open source contribution experience — finding and fixing a RetryTopic Bean naming inconsistency in Spring Kafka.",
      coverImage: "/kafka-retrytopic-new-thumbnail.png",
      published: true,
      categoryId: category.id,
    },
  });

  console.log("Post created:", post.id, post.slug);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
