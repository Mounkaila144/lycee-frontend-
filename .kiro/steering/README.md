# Kiro Steering Files - Navigation Guide

This directory contains steering files that provide context and guidance to Kiro AI assistant for working with this project.

## 📚 Available Steering Files

### 1. **project-overview.md** - Start Here!
**Purpose**: High-level project understanding
**Contains**:
- Project type and architecture
- Technology stack
- Multi-tenancy system
- Module structure
- Global contexts
- Path aliases
- Migration status

**When to reference**: When you need to understand the overall project structure or explain the architecture to someone.

---

### 2. **coding-standards.md** - Development Guidelines
**Purpose**: Code quality and consistency
**Contains**:
- Component structure patterns
- Styling guidelines (MUI priority)
- API integration patterns
- Form handling with React Hook Form + Valibot
- TypeScript standards
- Error handling
- Permissions & access control
- Import ordering
- Naming conventions

**When to reference**: When writing new code, creating components, or reviewing code quality.

---

### 3. **api-backend-integration.md** - Backend Communication
**Purpose**: API integration and backend communication
**Contains**:
- Backend API structure
- Authentication flow
- API client usage
- Common API patterns (GET, POST, PUT, DELETE)
- Pagination and filtering
- Multi-tenant considerations
- File uploads
- Error handling
- Testing methods

**When to reference**: When implementing API calls, debugging backend issues, or setting up new endpoints.

---

### 4. **common-tasks.md** - Practical Workflows
**Purpose**: Step-by-step guides for common development tasks
**Contains**:
- Creating a new module (complete workflow)
- Creating CRUD forms
- Creating data tables
- Adding permissions checks
- Development commands
- Debugging tips
- Common errors and solutions
- Git workflow
- Testing checklist

**When to reference**: When starting a new feature, debugging issues, or need a quick reference for common tasks.

---

### 5. **bmad-integration.md** - B-MAD Agent System
**Purpose**: Integration with B-MAD structured development methodology
**Contains**:
- Available B-MAD agents (James/dev, Architect, PM, PO, QA, etc.)
- How to invoke agents in Kiro
- James (dev) agent workflow and commands
- When to use B-MAD vs Kiro native
- Story development workflow
- B-MAD file structure reference
- Tips and troubleshooting

**When to reference**: When you need structured story-based development, formal testing workflows, or want to activate specialized agents.

---

## 🎯 Quick Reference by Task

### "I need to create a new feature"
→ Read: **common-tasks.md** (Creating a New Module section)
→ Follow: **coding-standards.md** (for code quality)
→ Reference: **api-backend-integration.md** (for API calls)

### "I need to understand the project structure"
→ Read: **project-overview.md**

### "I'm getting API errors"
→ Read: **api-backend-integration.md** (Error Handling & Common Issues)
→ Check: **common-tasks.md** (Debugging Tips)

### "How do I style components?"
→ Read: **coding-standards.md** (Styling Guidelines)
→ Priority: MUI Components > MUI sx prop > Tailwind utilities

### "How do I check user permissions?"
→ Read: **project-overview.md** (Permissions System)
→ Read: **coding-standards.md** (Permissions & Access Control)
→ Read: **common-tasks.md** (Adding Permissions Check)

### "How does multi-tenancy work?"
→ Read: **project-overview.md** (Multi-Tenancy Architecture)
→ Read: **api-backend-integration.md** (Multi-Tenant Considerations)

### "I need to create a form"
→ Read: **common-tasks.md** (Creating a CRUD Form)
→ Follow: **coding-standards.md** (Form Handling)

### "How do I make API calls?"
→ Read: **api-backend-integration.md** (API Client Usage & Common Patterns)
→ Follow: **coding-standards.md** (API Integration)

### "I want to implement a formal story"
→ Read: **bmad-integration.md** (B-MAD Agent System)
→ Activate: James (dev agent)
→ Command: `*develop-story`

### "How do I activate James/B-MAD agents?"
→ Read: **bmad-integration.md** (How to Invoke B-MAD Agents)
→ Say: "Active l'agent James" or "Charge l'agent dev"

---

## 🔄 How Kiro Uses These Files

Kiro automatically loads these steering files and uses them as context when:
- You ask questions about the project
- You request code generation
- You need help debugging
- You want to understand the architecture

**You don't need to manually reference these files** - Kiro has them in context!

---

## ✏️ Updating Steering Files

### When to Update

Update these files when:
- Project architecture changes
- New patterns are established
- New modules are added
- API structure changes
- New best practices are adopted

### How to Update

Simply edit the markdown files in `.kiro/steering/` directory. Kiro will automatically use the updated content in the next conversation.

---

## 📖 File Inclusion Rules

### Always Included (Default)
All files in `.kiro/steering/` are automatically included in Kiro's context by default.

### Conditional Inclusion (Advanced)
You can make files conditionally included by adding front-matter:

```markdown
---
inclusion: fileMatch
fileMatchPattern: 'src/modules/**'
---
# Your content here
```

This file will only be included when working with files matching the pattern.

### Manual Inclusion (Advanced)
```markdown
---
inclusion: manual
---
# Your content here
```

This file will only be included when you explicitly reference it with `#` in chat.

---

## 🎓 Best Practices

### For Developers
1. **Read project-overview.md first** when joining the project
2. **Keep coding-standards.md open** while coding
3. **Reference common-tasks.md** for step-by-step guides
4. **Consult api-backend-integration.md** when working with APIs

### For Kiro Users
1. **Trust that Kiro has the context** - these files are automatically loaded
2. **Ask specific questions** - Kiro will reference the appropriate steering file
3. **Request code generation** - Kiro will follow the patterns defined here
4. **Update steering files** when you establish new patterns

---

## 🚀 Getting Started Checklist

If you're new to this project:

- [ ] Read **project-overview.md** to understand the architecture
- [ ] Skim **coding-standards.md** to see code patterns
- [ ] Review **api-backend-integration.md** to understand backend communication
- [ ] Bookmark **common-tasks.md** for quick reference
- [ ] Set up your development environment (see project README.md)
- [ ] Run `pnpm dev` to start the development server
- [ ] Try creating a simple component following the patterns

---

## 📞 Need Help?

### Ask Kiro!
Kiro has all these files in context and can:
- Explain any concept from these files
- Generate code following these patterns
- Debug issues using these guidelines
- Create new features following these standards

### Example Questions
- "How do I create a new module for managing products?"
- "Show me how to add permissions check to a component"
- "What's the correct way to make an API call in this project?"
- "How does the multi-tenancy system work?"
- "Generate a CRUD form for a User entity"
- "Active l'agent James pour développer cette story"
- "Implémente la story docs/stories/story-042.md"
- "James, *explain ce que tu viens de faire"

---

## 📝 Document Version

**Last Updated**: January 2026
**Project**: Carpentry Multi-Tenant Admin
**Framework**: Next.js 15 + Material-UI 6
**Backend**: Laravel API

---

**Remember**: These steering files are living documents. Keep them updated as the project evolves!
