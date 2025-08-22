# Technical Debt

This file documents the technical debt found in the codebase as of 2025-08-22.

## ESLint Errors

The following errors were reported by `pnpm lint`.

### High Priority (Errors)

- **`@typescript-eslint/no-explicit-any`**: Numerous `any` types are used throughout the codebase. These should be replaced with specific types. This is a high-priority task but requires knowledge of the data structures, especially the data coming from Supabase.
- **`@typescript-eslint/no-empty-object-type`**: Found in `src/components/ui/command.tsx`, `src/components/ui/fab.tsx`, `src/components/ui/textarea.tsx`.
- **`no-useless-escape`**: Found in `src/pages/BlogPost.tsx`.
- **`prefer-const`**: Found in `src/pages/Dashboard.tsx`, `src/pages/Recibo.tsx`, `src/pages/admin/AdminPedidos.tsx`, `src/pages/admin/AdminPublicacoes.tsx`.
- **`@typescript-eslint/no-require-imports`**: Found in `tailwind.config.ts`.

### Medium Priority (Warnings)

- **`react-hooks/exhaustive-deps`**: Found in `src/components/admin/AdminBlogPublisher.tsx`, `src/pages/AdminBlogNew.tsx`.
- **`react-refresh/only-export-components`**: Found in several UI components and `CartContext.tsx`.

## Full ESLint Output

```
/app/src/components/admin/AdminBacklinksImport.tsx
   66:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   83:24  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  126:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  130:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  161:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  208:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/components/admin/AdminBacklinksManager.tsx
   60:74  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any
   68:5   warning  Unused eslint-disable directive (no problems were reported from 'react-hooks/exhaustive-deps')
   87:74  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any
  113:84  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any

/app/src/components/admin/AdminBlogPublisher.tsx
   45:6   warning  React Hook useEffect has a missing dependency: 'slug'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
   89:19  error    Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
  105:19  error    Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
  147:19  error    Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any

/app/src/components/auth/RequireRole.tsx
  11:36  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/components/layout/Header.tsx
  50:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/components/seo/SEOHead.tsx
  12:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/components/seo/StructuredData.tsx
   6:9   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  59:50  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  72:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/components/ui/badge.tsx
  40:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/components/ui/button.tsx
  56:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/components/ui/command.tsx
  24:11  error  An interface declaring no members is equivalent to its supertype  @typescript-eslint/no-empty-object-type

/app/src/components/ui/fab.tsx
  5:18  error  An interface declaring no members is equivalent to its supertype  @typescript-eslint/no-empty-object-type

/app/src/components/ui/form.tsx
  168:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/components/ui/navigation-menu.tsx
  119:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/components/ui/sidebar.tsx
  760:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/components/ui/textarea.tsx
  5:18  error  An interface declaring no members is equivalent to its supertype  @typescript-eslint/no-empty-object-type

/app/src/components/ui/toggle.tsx
  43:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/contexts/CartContext.tsx
  77:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/app/src/pages/AdminBlogNew.tsx
   65:6   warning  React Hook useEffect has a missing dependency: 'slug'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  104:19  error    Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
  120:19  error    Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
  162:19  error    Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any

/app/src/pages/AgenciaBacklinks.tsx
   19:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  120:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  123:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  144:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/Auth.tsx
  31:37  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/BlogPost.tsx
  57:15  error  Unnecessary escape character: \!  no-useless-escape
  59:16  error  Unnecessary escape character: \*  no-useless-escape

/app/src/pages/Carrinho.tsx
  43:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  44:47  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  45:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  63:53  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  63:70  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/Cart.tsx
  44:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  45:47  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  46:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  64:53  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  64:70  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinks.tsx
   21:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  122:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  125:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  146:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksAlimentacao.tsx
   24:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  151:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  155:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  178:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksAutomoveis.tsx
   23:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  153:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  157:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  180:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksCategoria.tsx
   50:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  100:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksDireito.tsx
   24:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  157:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  161:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  184:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksEducacao.tsx
   24:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  154:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  158:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  181:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksEntretenimento.tsx
   23:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  156:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  160:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  183:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksEsportes.tsx
   23:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  154:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  158:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  181:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksFinancas.tsx
   23:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  151:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  155:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  178:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksImoveis.tsx
   16:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  120:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  123:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  144:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksMarketing.tsx
   22:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  153:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  157:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  180:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksMaternidade.tsx
   16:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  123:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  126:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  147:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksModa.tsx
   22:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  150:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  154:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  177:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksNegocios.tsx
   80:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  208:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  212:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  235:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksNoticias.tsx
   22:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  150:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  154:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  177:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksPets.tsx
   23:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  148:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  152:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  175:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksSaude.tsx
   16:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  123:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  126:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  147:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksTecnologia.tsx
   22:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  150:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  154:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  177:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/ComprarBacklinksTurismo.tsx
   23:46  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  148:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  152:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  175:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/src/pages/Dashboard.tsx
   35:39  error  Unexpected any. Specify a different type                @typescript-eslint/no-explicit-any
   76:36  error  Unexpected any. Specify a different type                @typescript-eslint/no-explicit-any
   93:11  error  'summary' is never reassigned. Use 'const' instead      prefer-const
   94:11  error  'sites' is never reassigned. Use 'const' instead        prefer-const
  105:13  error  'backlinkMap' is never reassigned. Use 'const' instead  prefer-const
  209:36  error  Unexpected any. Specify a different type                @typescript-eslint/no-explicit-any
  222:11  error  'backlinkMap' is never reassigned. Use 'const' instead  prefer-const
  290:36  error  Unexpected any. Specify a different type                @typescript-eslint/no-explicit-any
  302:11  error  'backlinkMap' is never reassigned. Use 'const' instead  prefer-const

/app/src/pages/Recibo.tsx
   9:38  error  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any
  10:38  error  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any
  12:34  error  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any
  43:11  error  'm' is never reassigned. Use 'const' instead  prefer-const

/app/src/pages/admin/AdminPedidos.tsx
  50:27  error  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
  52:38  error  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
  55:9   error  'piiMap' is never reassigned. Use 'const' instead  prefer-const
  65:45  error  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any

/app/src/pages/admin/AdminPublicacoes.tsx
  38:11  error  'itemsMap' is never reassigned. Use 'const' instead  prefer-const
  39:68  error  Unexpected any. Specify a different type             @typescript-eslint/no-explicit-any
  41:34  error  Unexpected any. Specify a different type             @typescript-eslint/no-explicit-any
  42:67  error  Unexpected any. Specify a different type             @typescript-eslint/no-explicit-any
  53:35  error  Unexpected any. Specify a different type             @typescript-eslint/no-explicit-any

/app/supabase/functions/manual-create-order/index.ts
   97:68  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  152:30  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  158:52  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/supabase/functions/send-activation-email/index.ts
  55:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/supabase/functions/send-contact-email/index.ts
  71:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/supabase/functions/send-reset-password-email/index.ts
  53:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/app/tailwind.config.ts
  114:12  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports
```
