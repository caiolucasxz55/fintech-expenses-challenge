import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: { category: Record<string, jest.Mock> };

  const mockCategory: Category = {
    id: 'cat-uuid',
    name: 'Food',
    description: null,
    userId: 'user-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      prisma.category.create.mockResolvedValue(mockCategory);

      const result = await service.create('user-uuid', { name: 'Food' });

      expect(result).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Food', userId: 'user-uuid' },
      });
    });
  });

  describe('findAll', () => {
    it('should return only the authenticated user categories', async () => {
      prisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll('user-uuid');

      expect(result).toHaveLength(1);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return the category when found', async () => {
      prisma.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne('user-uuid', 'cat-uuid');

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-uuid', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when category belongs to another user', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne('other-user', 'cat-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the modified category', async () => {
      const updated = { ...mockCategory, name: 'Transport' };
      prisma.category.findFirst.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue(updated);

      const result = await service.update('user-uuid', 'cat-uuid', {
        name: 'Transport',
      });

      expect(result.name).toBe('Transport');
    });
  });

  describe('remove', () => {
    it('should delete the category without throwing', async () => {
      prisma.category.findFirst.mockResolvedValue(mockCategory);
      prisma.category.delete.mockResolvedValue(mockCategory);

      await expect(service.remove('user-uuid', 'cat-uuid')).resolves.not.toThrow();
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-uuid' },
      });
    });
  });
});
