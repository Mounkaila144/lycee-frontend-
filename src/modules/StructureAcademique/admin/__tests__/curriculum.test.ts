/**
 * Curriculum Tests - Tronc Commun et Options
 */

import { describe, it, expect } from '@jest/globals';
import {
  getSpecializationModuleTypeLabel,
  getSpecializationModuleTypeBadgeColor,
  getChoiceStatusLabel,
  getChoiceStatusColor,
} from '../../types/curriculum.types';

describe('Curriculum Helper Functions', () => {
  describe('getSpecializationModuleTypeLabel', () => {
    it('should return correct label for Obligatoire', () => {
      expect(getSpecializationModuleTypeLabel('Obligatoire')).toBe('Obligatoire');
    });

    it('should return correct label for Optionnel', () => {
      expect(getSpecializationModuleTypeLabel('Optionnel')).toBe('Optionnel');
    });
  });

  describe('getSpecializationModuleTypeBadgeColor', () => {
    it('should return success color for Obligatoire', () => {
      expect(getSpecializationModuleTypeBadgeColor('Obligatoire')).toBe('success');
    });

    it('should return info color for Optionnel', () => {
      expect(getSpecializationModuleTypeBadgeColor('Optionnel')).toBe('info');
    });
  });

  describe('getChoiceStatusLabel', () => {
    it('should return correct label for Pending', () => {
      expect(getChoiceStatusLabel('Pending')).toBe('En attente');
    });

    it('should return correct label for Confirmed', () => {
      expect(getChoiceStatusLabel('Confirmed')).toBe('Confirmé');
    });

    it('should return correct label for Cancelled', () => {
      expect(getChoiceStatusLabel('Cancelled')).toBe('Annulé');
    });
  });

  describe('getChoiceStatusColor', () => {
    it('should return warning color for Pending', () => {
      expect(getChoiceStatusColor('Pending')).toBe('warning');
    });

    it('should return success color for Confirmed', () => {
      expect(getChoiceStatusColor('Confirmed')).toBe('success');
    });

    it('should return error color for Cancelled', () => {
      expect(getChoiceStatusColor('Cancelled')).toBe('error');
    });
  });
});
