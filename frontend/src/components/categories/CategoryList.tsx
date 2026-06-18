'use client';

import { useState } from 'react';
import { FolderOpen, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteCategory } from '@/hooks/useCategories';
import type { Category } from '@/types';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
}

export function CategoryList({
  categories,
  isLoading,
  onEdit,
}: CategoryListProps) {
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const remove = useDeleteCategory();

  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="size-6 text-muted-foreground" />
        </span>
        <div>
          <p className="font-medium">Nenhuma categoria</p>
          <p className="text-sm text-muted-foreground">
            Crie sua primeira categoria para organizar o caixa.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="flex flex-row items-center justify-between gap-4 p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <FolderOpen className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {category.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {category.description || 'Sem descrição'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Editar categoria"
                onClick={() => onEdit(category)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir categoria"
                className="text-destructive hover:text-destructive"
                onClick={() => setToDelete(category)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria &quot;{toDelete?.name}&quot; será removida. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={remove.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
