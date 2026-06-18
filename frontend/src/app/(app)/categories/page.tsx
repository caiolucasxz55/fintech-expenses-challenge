'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex animate-fade-in flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Organize entradas e saídas por finalidade.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        onEdit={openEdit}
      />

      <CategoryForm open={open} onOpenChange={setOpen} category={selected} />
    </div>
  );
}
