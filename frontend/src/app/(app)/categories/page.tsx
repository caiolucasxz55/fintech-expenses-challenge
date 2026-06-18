'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const openCreate = () => {
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelected(category);
    setOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Categorias"
        description="Organize suas movimentações por categoria."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        }
      />

      <Card>
        <CategoryList
          categories={categories}
          isLoading={isLoading}
          onEdit={openEdit}
        />
      </Card>

      <CategoryForm open={open} onOpenChange={setOpen} category={selected} />
    </div>
  );
}
