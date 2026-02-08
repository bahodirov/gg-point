# 🚀 GGPoint Admin Panel - Claude Development Context

Welcome! This `.claude` folder contains comprehensive documentation and examples for developing the GGPoint admin panel. Use this as your reference guide for consistent, production-ready code.

---

## 📚 Documentation Files

### Core Documentation

1. **[project-context.md](./project-context.md)** - START HERE
   - Project overview and architecture
   - Technology stack details
   - Module structure and routing
   - Development workflow
   - Roadmap and next steps

2. **[api-patterns.md](./api-patterns.md)** - API Reference
   - Standard response/error formats
   - Endpoint patterns and conventions
   - Query parameters and pagination
   - Error handling examples
   - Rate limiting and caching

3. **[coding-standards.md](./coding-standards.md)** - Code Style Guide
   - TypeScript and Angular conventions
   - Naming conventions for files and code
   - Proper import organization
   - Signals and reactive state patterns
   - Language requirements (Uzbek/Russian/English)

4. **[component-patterns.md](./component-patterns.md)** - UI Patterns
   - Standard component structure
   - Material Design usage patterns
   - Form validation patterns
   - Data table patterns
   - Error handling in components
   - Responsive design and accessibility

5. **[database-schema.md](./database-schema.md)** - Database Reference
   - Core table structures
   - Data relationships
   - JSONB data patterns
   - Common SQL queries
   - Data type mappings

### Code Examples

6. **[examples/service.example.ts](./examples/service.example.ts)** - Service Template
   - Complete service implementation
   - CRUD operations
   - Error handling
   - Caching patterns
   - Usage examples

7. **[examples/component.example.ts](./examples/component.example.ts)** - Component Templates
   - List component with pagination
   - Form component (create/edit)
   - Dialog component
   - Validation and error handling
   - Best practices

---

## 🎯 Quick Start Checklist

### Creating a New Component

```bash
# 1. Create component file
src/app/admin/components/[feature-name]/[feature-name].component.ts

# 2. Define models/interfaces
src/app/admin/models/[feature-name].model.ts

# 3. Create service
src/app/admin/services/[feature-name].service.ts

# 4. Add to routing (app.routes.ts)
{
  path: '[features]',
  loadComponent: () => import('./admin/components/[feature]/[feature].component')
    .then(m => m.FeatureComponent)
}
```

### Before Committing Code

- [ ] Follows naming conventions (see [coding-standards.md](./coding-standards.md))
- [ ] TypeScript strict mode (no `any`)
- [ ] Components are standalone
- [ ] Services provided at root
- [ ] Error handling with MatSnackBar
- [ ] Loading states displayed
- [ ] Uzbek labels (UI), English (code)
- [ ] Responsive design tested
- [ ] Dark theme compatible
- [ ] No `console.log` in production
- [ ] Code formatted with Prettier

---

## 📋 Common Development Tasks

### Add a New Admin Page (e.g., Users Management)

1. **Create the component structure**:
   - `src/app/admin/components/user-list/`
   - `src/app/admin/components/user-form/`
   - `src/app/admin/models/user.model.ts`
   - `src/app/admin/services/user.service.ts`

2. **Define models**: Review [database-schema.md](./database-schema.md) for user table structure

3. **Implement service**: Use [service.example.ts](./examples/service.example.ts) as template

4. **Build components**: Use [component-patterns.md](./component-patterns.md) for patterns

5. **Add routes**: Update `src/app/app.routes.ts`

6. **Test**: Manual testing with different screen sizes and themes

### Create a Form Component

1. Reference [component.example.ts](./examples/component.example.ts) - ProductFormComponent
2. Use Reactive Forms with FormBuilder
3. Add validation using Validators
4. Handle errors with MatSnackBar
5. Show loading state during submit
6. Implement OnDestroy with takeUntil(destroy$)

### Handle API Errors

Pattern from [api-patterns.md](./api-patterns.md):

```typescript
this.service.getItems().subscribe({
  next: (response) => {
    this.items.set(response.data);
  },
  error: (error) => {
    const message = error.error?.error || 'Operation failed';
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }
});
```

### Make API Calls

1. Inject HttpClient in component
2. Reference endpoint paths from [api-patterns.md](./api-patterns.md)
3. Handle response format from [api-patterns.md](./api-patterns.md) - ApiResponse<T>
4. Always unsubscribe with takeUntil(destroy$)

---

## 🌍 Language Guide

### UI Labels (Uzbek Primary)

```typescript
// ❌ Wrong
<button>Add Product</button>

// ✅ Correct
<button>Mahsulot qo'shish</button>

// ✅ Also OK (using translation keys)
<button>{{ 'ADMIN.PRODUCTS.ADD' | translate }}</button>
```

### Code (English Only)

```typescript
// ✅ Correct
function calculateTotalPrice(items: Product[]): number { }

// ❌ Wrong
function hisoblangUmarTotal(mahsulotlar: Product[]): number { }
```

### Uzbek Text Examples

```
- Mahsulot qo'shish → Add product
- Tahrirlash → Edit
- O'chirish → Delete
- Saqlash → Save
- Bekor qilish → Cancel
- Xatolik yuz berdi → Error occurred
- Muvaffaqiyatli saqlandi → Saved successfully
```

---

## 🎨 Design System

### Material Components Used

| Component | Usage | Example |
|-----------|-------|---------|
| MatTable | Data lists | Product list, Order list |
| MatFormField | Form inputs | Product form |
| MatDialog | Modals | Confirm deletion |
| MatSnackBar | Notifications | Success/error messages |
| MatCard | Content containers | Dashboard stats |
| MatButton | Actions | Save, Cancel, Delete |
| MatIcon | Icons | Material icons |
| MatPaginator | Pagination | List pagination |
| MatSort | Table sorting | Column sorting |
| MatSpinner | Loading | Page/form loading |

### Color Palette

- **Primary**: #0891b2 (Cyan)
- **Secondary**: #0ea5e9 (Sky Blue)
- **Success**: #10b981 (Emerald)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)
- **Neutral**: #64748b (Slate)

See full design system in [component-patterns.md](./component-patterns.md)

---

## 🔧 Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:4200
# Login with admin credentials
```

### File Organization

```
src/app/admin/
├── components/
│   ├── dashboard/
│   ├── product-list/
│   ├── product-form/
│   └── user-list/
├── services/
│   ├── product.service.ts
│   └── user.service.ts
├── models/
│   ├── product.model.ts
│   └── user.model.ts
└── guards/
    └── auth.guard.ts
```

### Code Review Criteria

Before submitting PR:

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Follows standards? No `any` types?
3. **Error Handling**: Proper error messages?
4. **UX**: Loading states? Responsive? Dark theme?
5. **Accessibility**: ARIA labels? Keyboard navigation?
6. **Tests**: Unit tests passing?
7. **Performance**: No N+1 queries? Proper unsubscription?
8. **Documentation**: Comments where needed?

---

## 📞 Common Questions

### Q: How do I make an API call?

**A**: Use the service pattern from [examples/service.example.ts](./examples/service.example.ts):

```typescript
export class ProductService {
  private http = inject(HttpClient);

  list(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>('/api/products');
  }
}
```

### Q: How do I handle errors?

**A**: Follow the pattern in [api-patterns.md](./api-patterns.md) and [component-patterns.md](./component-patterns.md)

### Q: What about TypeScript types?

**A**: Always provide explicit types. See naming conventions in [coding-standards.md](./coding-standards.md)

### Q: How do I create a new page?

**A**: Follow the checklist in "Creating a New Component" above and reference the examples.

### Q: Where do I write Uzbek text?

**A**: In templates and labels. See [coding-standards.md](./coding-standards.md) for language guide.

### Q: How do I test responsiveness?

**A**: Use browser DevTools. Test: mobile (320px), tablet (768px), desktop (1024px+)

### Q: Where do I put utility functions?

**A**: Create `src/app/core/utils/` or `src/app/shared/utils/` folder

### Q: How do I unsubscribe properly?

**A**: Use `takeUntil(destroy$)` pattern shown in [examples/component.example.ts](./examples/component.example.ts)

---

## 🔗 External Resources

### Documentation Links

- **Angular Docs**: https://angular.io/docs
- **Angular Material**: https://material.angular.io
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **RxJS Documentation**: https://rxjs.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Team Resources

- **API Documentation**: Backend documentation
- **Design Mockups**: Figma/Design tool
- **Project Board**: Project management tool

---

## 🚀 Getting Help

### When Stuck

1. Check relevant documentation file (see list above)
2. Review example files in `examples/`
3. Search existing code for similar patterns
4. Ask team lead or senior developer
5. Review PR feedback for learning

### Reporting Issues

- Document the issue clearly
- Include error messages
- Provide reproduction steps
- Reference relevant documentation

---

## 📈 Continuous Improvement

This documentation is living and evolving. If you find:

- **Missing information**: Add it
- **Outdated patterns**: Update it
- **Better examples**: Share them
- **Helpful insights**: Document them

Keep `.claude/` files up-to-date as project standards evolve.

---

## 📝 File Structure Reference

```
.claude/
├── README.md                          ← You are here
├── project-context.md                 ← Project overview
├── api-patterns.md                    ← API reference
├── coding-standards.md                ← Code style guide
├── component-patterns.md              ← UI patterns
├── database-schema.md                 ← Database reference
└── examples/
    ├── service.example.ts             ← Service template
    └── component.example.ts           ← Component templates
```

---

## ✨ Quick Tips

1. **Use Signals** instead of observables when possible (Angular 17+)
2. **Always validate** user input on the frontend
3. **Show loading states** for better UX
4. **Handle errors gracefully** with meaningful messages
5. **Test dark theme** - use DevTools to toggle
6. **Keep components small** - <300 lines ideally
7. **Reuse Material components** - don't reinvent the wheel
8. **Write unit tests** for services and complex logic
9. **Document complex logic** with comments
10. **Ask questions** - knowledge sharing is encouraged

---

## 🎓 Learning Path

### For New Developers

1. Read [project-context.md](./project-context.md)
2. Review [coding-standards.md](./coding-standards.md)
3. Study [component-patterns.md](./component-patterns.md)
4. Review existing components in `src/app/admin/components/`
5. Build first feature using examples as templates

### For Experienced Developers

1. Review [api-patterns.md](./api-patterns.md) for integration details
2. Check [database-schema.md](./database-schema.md) for data structure
3. Review [examples/service.example.ts](./examples/service.example.ts) for service patterns
4. Implement new features using established patterns

---

## 📅 Last Updated

**2025-02-08** by Development Team

For updates, see git history or team documentation.

---

## 🙏 Thank You

Thank you for contributing to GGPoint! Follow these standards to maintain code quality, improve collaboration, and build a product we're all proud of.

**Happy coding!** 🚀

