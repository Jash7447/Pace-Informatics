'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onCategoryChange?: () => void;
}

export default function Sidebar({ selectedCategory, onCategorySelect, onCategoryChange }: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewCategoryName('');
        setNewCategoryDescription('');
        setIsDialogOpen(false);
        fetchCategories();
        onCategoryChange?.();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new product category to organize your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Category Name *
                </label>
                <Input
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Electronics, Furniture"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-2">
          <Button
            variant={selectedCategory === null ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onCategorySelect(null)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            All Products
          </Button>
        </div>
        {loading ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            No categories yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category._id}
                variant={selectedCategory === category._id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left',
                  selectedCategory === category._id && 'bg-secondary'
                )}
                onClick={() => onCategorySelect(category._id)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

