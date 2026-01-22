# 🚀 Quick Start Guide - Kiro + B-MAD

## Your Setup is Complete! ✅

You now have a fully configured development environment with:
- ✅ Kiro AI assistant with project context
- ✅ B-MAD structured development methodology
- ✅ 5 steering files with comprehensive guidance
- ✅ Hybrid workflow (Kiro + B-MAD agents)

## 🎯 Choose Your Workflow

### Option 1: Quick Development (Kiro Native)
**Best for**: Prototyping, debugging, learning, ad-hoc tasks

**Example**:
```
"Crée un composant UserList avec MUI et pagination"
"Aide-moi à débugger cette erreur 401"
"Explique-moi comment fonctionne le multi-tenancy"
"Convertis ce composant Tailwind en MUI"
```

**What happens**:
- Kiro uses steering files automatically
- Follows coding standards
- Uses MUI patterns
- No formal story tracking

---

### Option 2: Structured Development (B-MAD with James)
**Best for**: Feature implementation, formal stories, comprehensive testing

**Example**:
```
"Active l'agent James"
"James, implémente la story docs/stories/story-042.md"
"*develop-story"
```

**What happens**:
- James loads and adopts dev persona
- Reads story requirements
- Implements tasks sequentially
- Writes comprehensive tests
- Updates story checkboxes
- Validates everything
- Sets status to "Ready for Review"

---

### Option 3: Hybrid Approach (Best of Both)
**Best for**: Structured development with modern patterns

**Example**:
```
"James, utilise les standards Kiro pour implémenter cette story"
```

**What happens**:
- James follows B-MAD workflow (structured, tested)
- Uses Kiro steering files (MUI patterns, API standards)
- Gets comprehensive testing + modern code patterns

---

## 📋 Common Scenarios

### Scenario 1: "I need to add a new feature"

**With Story (Recommended)**:
```
1. "Crée une story pour le module Products CRUD"
2. "Active l'agent James"
3. "*develop-story"
4. Wait for "Ready for Review"
5. Review and merge
```

**Without Story (Quick)**:
```
1. "Crée un module Products avec CRUD complet"
2. Kiro generates everything following standards
3. Review and adjust as needed
```

---

### Scenario 2: "I'm debugging an issue"

**Quick Debug**:
```
"Pourquoi ce composant ne charge pas les données?"
"Aide-moi à corriger cette erreur de permissions"
```

**With James (Learning Mode)**:
```
"James, analyse ce bug et *explain la solution"
```

---

### Scenario 3: "I need to understand the codebase"

```
"Explique-moi l'architecture multi-tenant"
"Comment fonctionne le système de permissions?"
"Montre-moi comment créer un nouveau module"
```

Kiro will reference the appropriate steering files automatically.

---

### Scenario 4: "I'm converting old code to new patterns"

```
"Convertis ce composant Tailwind en MUI"
"Adapte ce service pour utiliser createApiClient()"
"Refactorise ce formulaire avec React Hook Form + Valibot"
```

---

## 🎓 Learning Path

### Day 1: Get Familiar
1. Read `.kiro/steering/project-overview.md`
2. Skim `.kiro/steering/coding-standards.md`
3. Try: "Crée un composant simple avec MUI"
4. Try: "Active l'agent James" and run "*help"

### Day 2: Build Something
1. Create a simple CRUD module without story
2. Ask Kiro to explain each step
3. Review generated code

### Day 3: Use B-MAD
1. Create a formal story
2. Activate James
3. Run `*develop-story`
4. Observe the structured workflow

### Day 4: Master the Hybrid
1. Use James with Kiro steering
2. Combine structured workflow + modern patterns
3. You're now a power user! 🚀

---

## 💡 Pro Tips

### 1. Trust the Context
Kiro has all steering files loaded. Just ask naturally:
```
"Comment je fais ça?" ✅
"Lis le fichier coding-standards.md et dis-moi comment faire ça" ❌ (unnecessary)
```

### 2. Be Specific with James
When using B-MAD agents, be clear:
```
"James, implémente la story-042" ✅
"Fais quelque chose" ❌ (too vague)
```

### 3. Use *explain for Learning
After James does something complex:
```
"*explain"
```
He'll teach you like training a junior engineer.

### 4. Combine Approaches
```
"Utilise les patterns Kiro pour cette story B-MAD"
```
Get the best of both worlds!

### 5. Update Steering Files
When you establish new patterns:
```
"Ajoute ce pattern dans coding-standards.md"
```
Keep your knowledge base current.

---

## 🔧 Quick Commands Reference

### Kiro Native
| Task | Command |
|------|---------|
| Create component | "Crée un composant X avec MUI" |
| Debug issue | "Aide-moi à débugger X" |
| Explain concept | "Explique-moi X" |
| Convert code | "Convertis X en Y" |
| Generate CRUD | "Crée un module CRUD pour X" |

### B-MAD (James)
| Task | Command |
|------|---------|
| Activate | "Active l'agent James" |
| Show commands | "*help" |
| Implement story | "*develop-story" |
| Explain action | "*explain" |
| Run tests | "*run-tests" |
| Apply QA fixes | "*review-qa" |
| Exit agent | "*exit" |

---

## 🎯 Your First Task

Try this right now:

```
"Crée un composant simple UserCard avec MUI qui affiche un nom et un email"
```

Kiro will:
1. Use MUI components (from coding-standards.md)
2. Follow proper structure (from coding-standards.md)
3. Add TypeScript types (from coding-standards.md)
4. Use proper imports order (from coding-standards.md)

All automatically! 🎉

---

## 📞 Need Help?

### Ask Kiro!
```
"Comment je fais pour X?"
"Montre-moi un exemple de Y"
"Explique-moi Z"
```

### Activate James for Structured Work
```
"Active l'agent James"
"*help"
```

### Check the Steering Files
All documentation is in `.kiro/steering/`:
- `README.md` - Navigation guide
- `project-overview.md` - Architecture
- `coding-standards.md` - Code patterns
- `api-backend-integration.md` - API usage
- `common-tasks.md` - Workflows
- `bmad-integration.md` - B-MAD agents

---

## 🎊 You're Ready!

Your development environment is fully configured and ready to use.

**Start with something simple, then gradually use more advanced features.**

Happy coding! 🚀
