Failed to compile.
./app/admin/owners/page.tsx:11:28
Type error: 'session.user' is possibly 'undefined'.
   9 | export default async function AdminOwnersPage() {
  10 |   const session = await getServerSession(authOptions);
> 11 |   if (!session || !hasRole(session.user.roles as any, ROLES.OWNER)) {
     |                            ^
  12 |     redirect('/');
  13 |   }
  14 |   return (
/opt/render/project/src/apps/web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  freeagentsltd-web@1.0.0 build: `next build`
Exit status 1
