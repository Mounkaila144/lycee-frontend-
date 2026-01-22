# 🎓 Specializations Management Module

## Overview

Complete frontend implementation for managing academic specializations within programmes. This module allows administrators to create, manage, and assign students to specializations (e.g., AI, Cybersecurity, Web Development) with configurable capacity limits, application periods, and selection criteria.

## 📁 Module Structure

```
src/modules/StructureAcademique/
├── types/
│   └── specialization.types.ts          # TypeScript types and interfaces
├── admin/
│   ├── services/
│   │   └── specializationService.ts     # API service layer
│   ├── hooks/
│   │   ├── useSpecializations.ts        # CRUD operations hook
│   │   └── useSpecializationCandidates.ts # Candidate management hook
│   └── components/
│       ├── SpecializationList.tsx       # Main container component
│       ├── SpecializationListTable.tsx  # Table display
│       ├── SpecializationFormDialog.tsx # Create/Edit form
│       ├── SpecializationDeleteDialog.tsx # Delete confirmation
│       └── SpecializationCandidatesDialog.tsx # Candidate management
└── app/[lang]/admin/structure/
    └── specializations/
        └── page.tsx                     # Route page
```

## 🚀 Quick Start

### 1. Navigate to Specializations Page

```
URL: /admin/structure/specializations
Menu: Structure Académique → Spécialités
```

### 2. Create Your First Specialization

```typescript
{
  code: "IA-2026",
  name: "Intelligence Artificielle",
  description: "Spécialisation en IA et Machine Learning",
  programme_id: 1,
  available_from_level: 3,  // L3
  capacity: 30,
  min_average_required: 12.0,
  application_start_date: "2026-01-01",
  application_end_date: "2026-03-31",
  type: "Obligatoire",
  selection_mode: "Exclusive",
  is_active: true
}
```

### 3. Use in Your Code

```typescript
import { SpecializationList } from '@/modules/StructureAcademique'

export default function Page() {
  return <SpecializationList />
}
```

## 🎯 Features

### ✅ Core Features
- **CRUD Operations**: Create, Read, Update, Delete specializations
- **Capacity Management**: Set and track capacity limits
- **Application Periods**: Configure start and end dates for applications
- **Access Criteria**: Set minimum average requirements
- **Type Configuration**: Obligatoire (mandatory) or Optionnelle (optional)
- **Selection Modes**: Exclusive (one only) or Multiple (several allowed)
- **Responsable Assignment**: Assign a responsible person

### ✅ Candidate Management
- **View Candidates**: See all applicants for a specialization
- **Application Tracking**: Monitor application status (pending, accepted, rejected, waitlist)
- **Batch Assignment**: Select and assign multiple students at once
- **Waitlist Management**: Promote students from waitlist when places available
- **Preference Ordering**: Track student preference order

### ✅ UI/UX Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Status Indicators**: Color-coded chips for status, type, and mode
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with Valibot
- **Confirmation Dialogs**: Prevent accidental deletions

## 📊 Data Model

### Specialization
```typescript
{
  id: number
  code: string                    // Unique code (e.g., "IA-2026")
  name: string                    // Display name
  description: string | null      // Optional description
  programme_id: number            // Parent programme
  available_from_level: number    // Minimum level (1-5)
  capacity: number | null         // Max students (null = unlimited)
  responsable_id: number | null   // Responsible person
  min_average_required: number | null  // Minimum average
  application_start_date: string | null
  application_end_date: string | null
  type: 'Obligatoire' | 'Optionnelle'
  selection_mode: 'Exclusive' | 'Multiple'
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Student Specialization (Application)
```typescript
{
  id: number
  student_id: number
  specialization_id: number
  application_date: string
  status: 'pending' | 'accepted' | 'rejected' | 'waitlist' | 'cancelled'
  average_at_application: number | null
  preference_order: number
  assigned_at: string | null
  rejection_reason: string | null
}
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/specializations` | List all specializations |
| POST | `/api/admin/specializations` | Create new specialization |
| GET | `/api/admin/specializations/{id}` | Get specialization details |
| PUT | `/api/admin/specializations/{id}` | Update specialization |
| DELETE | `/api/admin/specializations/{id}` | Delete specialization |
| GET | `/api/admin/specializations/{id}/candidates` | Get candidates |
| POST | `/api/admin/specializations/{id}/apply` | Apply (student) |
| DELETE | `/api/admin/specializations/{id}/cancel-application` | Cancel application |
| POST | `/api/admin/specializations/{id}/assign-students` | Assign students (batch) |
| POST | `/api/admin/specializations/{id}/promote-waitlist` | Promote waitlist |

## 💻 Usage Examples

### Basic Usage
```typescript
import { SpecializationList } from '@/modules/StructureAcademique'

export default function SpecializationsPage() {
  return <SpecializationList />
}
```

### Using Hooks
```typescript
import { useSpecializations } from '@/modules/StructureAcademique'

const { specializations, loading, error, createSpecialization } = useSpecializations()
```

### Using Service Directly
```typescript
import { specializationService } from '@/modules/StructureAcademique'

const specializations = await specializationService.getAll()
```

See `SPECIALIZATIONS_USAGE_EXAMPLES.md` for more detailed examples.

## 🧪 Testing

### Manual Testing
1. Create a specialization
2. Edit the specialization
3. View candidates (empty state)
4. Delete the specialization

### API Testing
```bash
curl -X GET http://localhost:8000/api/admin/specializations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

See `SPECIALIZATIONS_TESTING_GUIDE.md` for complete testing guide.

## 🔐 Permissions

Required permissions:
- `specializations.manage` - For admin CRUD operations
- `specializations.apply` - For student applications

## 📚 Documentation Files

- `SPECIALIZATIONS_README.md` - This file (overview)
- `SPECIALIZATIONS_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `SPECIALIZATIONS_TESTING_GUIDE.md` - Testing scenarios
- `SPECIALIZATIONS_USAGE_EXAMPLES.md` - Code examples

## 🎨 UI Components

### SpecializationList
Main container component with:
- List display
- Create button
- Edit/Delete actions
- Candidate management

### SpecializationListTable
Table with columns:
- Code, Name, Programme
- Level, Type, Mode
- Places (capacity tracking)
- Candidates count
- Status (active/inactive)
- Actions (edit, delete, view candidates)

### SpecializationFormDialog
Form with fields:
- Basic info (code, name, description)
- Programme selection
- Level configuration
- Capacity and average requirements
- Application period
- Type and selection mode
- Active status

### SpecializationCandidatesDialog
Candidate management with:
- Candidate list with status
- Batch selection
- Assign selected button
- Promote waitlist button
- Statistics display

## 🔄 Data Flow

```
User Action
    ↓
Component (SpecializationList)
    ↓
Hook (useSpecializations)
    ↓
Service (specializationService)
    ↓
API Client (createApiClient)
    ↓
Backend API
    ↓
Response
    ↓
State Update
    ↓
UI Re-render
```

## 🎯 Business Rules

1. **Capacity Enforcement**: Cannot assign more students than capacity
2. **Application Period**: Applications only accepted during configured period
3. **Minimum Average**: Students must meet minimum average requirement
4. **Exclusive Mode**: Students can only select one exclusive specialization
5. **Multiple Mode**: Students can select multiple specializations
6. **Obligatoire Type**: All students must choose a specialization
7. **Optionnelle Type**: Specialization choice is optional

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Failed to fetch specializations"
- **Solution**: Check backend API is running and accessible

**Issue**: "Programme is required" error
- **Solution**: Create at least one programme first

**Issue**: Form validation errors
- **Solution**: Ensure all required fields are filled

**Issue**: Candidates dialog not loading
- **Solution**: Check backend route exists and specialization ID is correct

## 📈 Future Enhancements

- [ ] Search and filter functionality
- [ ] Pagination for large lists
- [ ] Export to Excel/PDF
- [ ] Bulk import from CSV
- [ ] Email notifications for applications
- [ ] Student dashboard for applications
- [ ] Analytics and reporting
- [ ] Application workflow automation

## 🤝 Contributing

When adding new features:
1. Update types in `specialization.types.ts`
2. Add service methods in `specializationService.ts`
3. Create/update hooks as needed
4. Update components
5. Add tests
6. Update documentation

## 📞 Support

For issues or questions:
- Check documentation files
- Review usage examples
- Test with API directly
- Check browser console for errors

## ✅ Status

**Implementation**: ✅ Complete
**Testing**: ⏳ Pending
**Documentation**: ✅ Complete
**Ready for**: Integration and Testing

---

**Version**: 1.0.0
**Last Updated**: January 15, 2026
**Developer**: James (AI Agent)
**Story**: structure-academique.gestion-specialites.01-creation-specialites
