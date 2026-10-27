# English Game Hub — 온라인 동기화 설정
현재 GitHub Pages는 배포되어 있지만 GitHub 로그인만으로 공용 목록 저장이 활성화되지는 않습니다.

1. Supabase에서 프로젝트를 생성합니다.
2. SQL Editor에 SUPABASE_SETUP.sql을 실행합니다.
3. Authentication > Users에서 교사 관리자 계정을 만들고 user UUID를 확인합니다.
4. SQL Editor에서 insert into public.hub_admins(user_id) values ('실제-UUID'); 를 실행합니다.
5. cloud-config.js의 url 및 anonKey(publishable key)를 입력해 저장합니다.
6. 사이트의 설정 메뉴에서 ‘온라인 관리자 로그인’으로 접속하고 ‘기본 목록 공용 등록’을 실행합니다.
7. 이후 수정 내용이 공용 DB에 반영되어 모든 기기에서 보입니다.

service_role/secret 키 또는 관리자 비밀번호를 GitHub에 올리지 마세요.
프로젝트 주소와 공개용 키는 공개 웹사이트에 사용 가능하지만,
RLS 정책이 올바르게 적용되어 있어야 합니다.
