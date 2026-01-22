'use client';

import { useState } from 'react';

import { GroupList } from './GroupList';
import { GroupAssignmentDashboard } from './GroupAssignmentDashboard';

import type { Group } from '../../types/group.types';

/**
 * Groups Page Component
 * Main page for group management with list and assignment dashboard
 */
export const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);

  const handleViewAssignments = (group: Group) => {
    setSelectedGroup(group);
    setShowAssignments(true);
  };

  const handleBack = () => {
    setSelectedGroup(null);
    setShowAssignments(false);
  };

  if (showAssignments && selectedGroup) {
    return (
      <GroupAssignmentDashboard
        initialGroup={selectedGroup}
        moduleId={selectedGroup.module_id}
        level={selectedGroup.level}
        academicYearId={selectedGroup.academic_year_id}
        onBack={handleBack}
      />
    );
  }

  return <GroupList onViewAssignments={handleViewAssignments} />;
};
