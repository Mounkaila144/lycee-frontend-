# B-MAD Integration with Kiro

## What is B-MAD?

B-MAD (BMAD Core) is a structured development methodology with specialized AI agents for different roles in the software development lifecycle.

## Available B-MAD Agents

Your project has the following B-MAD agents configured:

### 💻 **James (dev)** - Full Stack Developer
**Primary Agent for Implementation**
- **Role**: Expert Senior Software Engineer & Implementation Specialist
- **Use for**: Code implementation, debugging, refactoring, development best practices
- **Activation**: Load `.bmad-core/agents/dev.md`
- **Commands**: `*help`, `*develop-story`, `*explain`, `*review-qa`, `*run-tests`, `*exit`

### 🏗️ **Architect** - System Architect
- **Use for**: Architecture decisions, system design, technical planning
- **Activation**: Load `.bmad-core/agents/architect.md`

### 📋 **PM** - Project Manager
- **Use for**: Project planning, timeline management, resource allocation
- **Activation**: Load `.bmad-core/agents/pm.md`

### 📝 **PO** - Product Owner
- **Use for**: Requirements gathering, user stories, backlog management
- **Activation**: Load `.bmad-core/agents/po.md`

### 🧪 **QA** - Quality Assurance
- **Use for**: Testing strategies, quality gates, bug verification
- **Activation**: Load `.bmad-core/agents/qa.md`

### 📊 **Analyst** - Business Analyst
- **Use for**: Requirements analysis, business logic, process flows
- **Activation**: Load `.bmad-core/agents/analyst.md`

### 🎨 **UX Expert** - UX/UI Specialist
- **Use for**: User experience, interface design, usability
- **Activation**: Load `.bmad-core/agents/ux-expert.md`

### 🏃 **SM** - Scrum Master
- **Use for**: Agile ceremonies, team facilitation, impediment removal
- **Activation**: Load `.bmad-core/agents/sm.md`

### 🎯 **BMAD Master** - Orchestrator
- **Use for**: Overall coordination, workflow management
- **Activation**: Load `.bmad-core/agents/bmad-master.md`

## How to Invoke B-MAD Agents in Kiro

### Method 1: Direct Request (Recommended)
Simply ask Kiro to activate the agent:

```
"Active l'agent James pour développer cette story"
"Charge l'agent dev pour implémenter cette fonctionnalité"
"J'ai besoin de James pour coder ce module"
```

Kiro will automatically:
1. Read the agent file (`.bmad-core/agents/dev.md`)
2. Adopt the persona
3. Load required files from `devLoadAlwaysFiles`
4. Execute the agent's activation instructions

### Method 2: Explicit File Reference
```
"Lis et active .bmad-core/agents/dev.md"
"Charge le fichier .bmad-core/agents/dev.md et deviens James"
```

### Method 3: Story Development Workflow
```
"Implémente la story docs/stories/story-001.md avec James"
"Développe la story en cours avec l'agent dev"
```

## B-MAD Project Configuration

Your project is configured with:

### Always-Loaded Files (for dev agent)
When James (dev agent) activates, these files are automatically loaded:
- `docs/architecture/coding-standards.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/source-tree.md`

### Story Location
- Stories are stored in: `docs/stories/`
- Story template: `.bmad-core/templates/story-tmpl.yaml`

### Documentation Structure
- **PRD**: `docs/prd.md` (sharded in `docs/prd/`)
- **Architecture**: `docs/architecture.md` (sharded in `docs/architecture/`)
- **QA Reports**: `docs/qa/`
- **Debug Log**: `.ai/debug-log.md`

## James (dev) Agent Workflow

### Activation Sequence
1. Read agent file completely
2. Adopt persona (Expert Senior Software Engineer)
3. Load `.bmad-core/core-config.yaml`
4. Load `devLoadAlwaysFiles` (coding standards, tech stack, source tree)
5. Greet user and run `*help`
6. HALT and await commands

### Development Commands

#### `*help`
Shows all available commands with numbered list

#### `*develop-story`
**Main development command** - Implements a story following this workflow:
1. Read first/next task
2. Implement task and subtasks
3. Write tests
4. Execute validations
5. If all pass, mark task checkbox [x]
6. Update File List in story
7. Repeat until all tasks complete
8. Run story-dod-checklist
9. Set status to "Ready for Review"

**Critical Rules**:
- ONLY updates Dev Agent Record sections in story file
- NEVER modifies Story, Acceptance Criteria, or Testing sections
- Blocks on: unapproved dependencies, ambiguity, 3 failures, missing config
- Completion requires: All tasks [x], all validations pass, File List complete

#### `*explain`
Teaches you what and why the agent did something (training mode)

#### `*review-qa`
Runs task `apply-qa-fixes.md` to address QA feedback

#### `*run-tests`
Executes linting and tests

#### `*exit`
Agent says goodbye and exits persona

## Integration with Kiro Steering

### When to Use B-MAD vs Kiro Native

**Use B-MAD Agents (James) when**:
- ✅ You have a formal story to implement
- ✅ You need structured workflow with checkboxes
- ✅ You want strict adherence to story requirements
- ✅ You need comprehensive testing and validation
- ✅ You want detailed change logs and file tracking

**Use Kiro Native when**:
- ✅ Quick prototyping or exploration
- ✅ Debugging without formal story
- ✅ Learning or explaining concepts
- ✅ Refactoring existing code
- ✅ Ad-hoc development tasks

### Hybrid Approach (Best of Both Worlds)

You can combine both:

```
"James, utilise les standards de Kiro steering pour implémenter cette story"
```

This way:
- James follows B-MAD workflow (structured, tested, validated)
- Uses Kiro steering files for coding standards and patterns
- Gets best of both methodologies

## Example Workflows

### Starting a New Story
```
User: "James, implémente la story docs/stories/story-042-user-crud.md"

James will:
1. Load story file
2. Load devLoadAlwaysFiles
3. Read all tasks
4. Implement first task
5. Write tests
6. Validate
7. Mark checkbox
8. Continue to next task
```

### Quick Development (No Story)
```
User: "Crée un composant UserList avec MUI"

Kiro will:
1. Use steering files (coding-standards.md)
2. Follow MUI patterns
3. Create component with proper structure
4. No formal story tracking
```

### Debugging with James
```
User: "James, *explain pourquoi ce composant ne fonctionne pas"

James will:
1. Analyze the code
2. Explain the issue in detail
3. Teach you the solution (training mode)
```

## B-MAD File Structure Reference

### Tasks (`.bmad-core/tasks/`)
Executable workflows that agents follow:
- `create-next-story.md` - Create new story
- `apply-qa-fixes.md` - Apply QA feedback
- `execute-checklist.md` - Run checklist validation
- `validate-next-story.md` - Validate story before dev
- `review-story.md` - Review completed story

### Checklists (`.bmad-core/checklists/`)
Quality gates and validation lists:
- `story-dod-checklist.md` - Definition of Done
- `story-draft-checklist.md` - Story draft validation
- `architect-checklist.md` - Architecture review
- `pm-checklist.md` - Project management checks

### Templates (`.bmad-core/templates/`)
Document templates for consistency:
- `story-tmpl.yaml` - Story template
- `prd-tmpl.yaml` - PRD template
- `architecture-tmpl.yaml` - Architecture doc template

## Tips for Working with James

### 1. Always Have a Story Ready
James works best with formal stories. Create one first:
```
"Crée une story pour implémenter le module Products"
```

### 2. Let James Follow His Workflow
Don't interrupt the `*develop-story` workflow. James is methodical and thorough.

### 3. Use *explain for Learning
When James does something complex:
```
"*explain"
```
He'll teach you like training a junior engineer.

### 4. Trust the Process
James will:
- Write comprehensive tests
- Validate everything
- Update documentation
- Follow all standards

### 5. Review Before Merging
When James says "Ready for Review", do a final check before merging.

## Troubleshooting

### "James won't start"
**Solution**: Ensure story file exists and is not in draft mode

### "James is blocked"
**Reasons**:
- Unapproved dependencies needed
- Ambiguous requirements
- 3 consecutive failures
- Missing configuration

**Solution**: Address the blocking issue, then continue

### "James modified wrong sections"
**This shouldn't happen** - James is only authorized to edit:
- Task checkboxes
- Dev Agent Record section
- Debug Log
- Completion Notes
- File List
- Change Log
- Status

If this happens, it's a bug in the agent behavior.

## Quick Reference Card

| Task | Command |
|------|---------|
| Activate James | "Active l'agent dev" or "Charge James" |
| Implement story | "*develop-story" |
| Explain action | "*explain" |
| Run tests | "*run-tests" |
| Apply QA fixes | "*review-qa" |
| Show commands | "*help" |
| Exit agent | "*exit" |

## Integration with Your Project

Your Carpentry project now has:
- ✅ Kiro steering files (coding standards, API patterns, common tasks)
- ✅ B-MAD agents (structured development workflow)
- ✅ Hybrid approach available

**Best Practice**: Use James for formal feature development, use Kiro native for exploration and quick tasks.
