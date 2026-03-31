---
description: 컨벤셔널 커밋 메시지로 잘 포멧된 커밋을 생성
argument-hint: [message]
model: haiku
allowed-tools: 'Bash(git:*)'
---

# claude custom command: commit

이모지와 컨벤셔널 커밋 메시지로 잘 포멧된 커밋을 생성합니다.

## 사용법

```
/git:commit
```

## 프로세스

- git 변경 내용을 commit
- 만약 인자로 커밋 메시지가 전달되면 해당 인자 사용
- 인자가 없으면 커밋 메시지를 생성
- 컨벤셔널 포맷으로 커밋 생성
- 필요하다면 분할 제안
- commit이 성공적으로 완료되면 push 진행

## 커밋 포멧

<이모지> <타입>: <설명>

**타입**

- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서화
- style: 포멧팅
- refactor: 코드 리팩토링
- test: 테스트
- perf: 성능 개선
- chore: 빌드/도구

**규칙**

- 명령형 어조 사용
- 첫 줄 72자 미만
- 단일 목적 커밋
- 관련 없는 변경사항은 분할
