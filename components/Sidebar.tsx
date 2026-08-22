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
import { Plus, FolderOpen, Trash2, AlertTriangle, Download } from 'lucide-react';
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

  // Delete Category states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [associatedProducts, setAssociatedProducts] = useState<Array<{ _id: string; name: string; brand: string; model?: string }>>([]);
  const [fetchingAssociated, setFetchingAssociated] = useState(false);
  const [deleteAction, setDeleteAction] = useState<'none' | 'cascade' | 'migrate'>('none');
  const [migrationTargetId, setMigrationTargetId] = useState<string>('');

  // Download History states
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadRange, setDownloadRange] = useState('all');

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

  const handleOpenDeleteDialog = async (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
    setFetchingAssociated(true);
    setDeleteAction('none');
    setMigrationTargetId('');
    setAssociatedProducts([]);

    try {
      const response = await fetch(`/api/products?category=${category._id}`);
      const data = await response.json();
      if (data.success) {
        setAssociatedProducts(data.data);
        if (data.data.length > 0) {
          const otherCategories = categories.filter(c => c._id !== category._id);
          if (otherCategories.length > 0) {
            setDeleteAction('migrate');
            setMigrationTargetId(otherCategories[0]._id);
          } else {
            setDeleteAction('cascade');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch associated products:', error);
    } finally {
      setFetchingAssociated(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    let url = `/api/categories/${categoryToDelete._id}`;

    if (associatedProducts.length > 0) {
      if (deleteAction === 'migrate') {
        if (!migrationTargetId) {
          alert('Please select a target category to move products to.');
          return;
        }
        url += `?action=move-products&transferTo=${migrationTargetId}`;
      } else if (deleteAction === 'cascade') {
        if (!confirm(`Warning: This will permanently delete all ${associatedProducts.length} products inside this category. Do you want to proceed?`)) {
          return;
        }
        url += `?action=delete-products`;
      } else {
        alert('Please choose an action for the associated products.');
        return;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setIsDeleteOpen(false);
        setCategoryToDelete(null);
        if (selectedCategory === categoryToDelete._id) {
          onCategorySelect(null);
        }
        fetchCategories();
        onCategoryChange?.();
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const handleDownloadExcel = () => {
    window.location.href = `/api/transactions/download?range=${downloadRange}`;
    setIsDownloadDialogOpen(false);
  };

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      <div className="p-4 border-b space-y-2">
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

        <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Download History</DialogTitle>
              <DialogDescription>
                Select the time range for the Excel transaction report.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="download-range" className="text-sm font-medium">
                  Time Period
                </label>
                <select
                  id="download-range"
                  value={downloadRange}
                  onChange={(e) => setDownloadRange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="1m">Last 1 Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last 1 Year</option>
                  <option value="5y">Last 5 Years</option>
                  <option value="all">All-time History</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownloadExcel}>Download Excel</Button>
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
              <div
                key={category._id}
                className={cn(
                  'group flex items-center justify-between rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-secondary/40',
                  selectedCategory === category._id && 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <Button
                  variant="ghost"
                  className="flex-1 justify-start text-left bg-transparent hover:bg-transparent shadow-none px-2 h-8 truncate overflow-ellipsis"
                  onClick={() => onCategorySelect(category._id)}
                >
                  <FolderOpen className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">{category.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteDialog(category);
                  }}
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete category "{categoryToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>

          {fetchingAssociated ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Checking for associated products...
            </div>
          ) : associatedProducts.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground text-center">
              This category has no associated products. You can safely delete it.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-amber-800 border border-amber-200 border-solid">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Associated Products Found</p>
                  <p className="text-xs mt-0.5">
                    There are <strong>{associatedProducts.length}</strong> product(s) currently assigned to this category.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Products list:</label>
                <div className="max-h-28 overflow-y-auto border rounded-md p-2 bg-gray-55 text-xs space-y-1">
                  {associatedProducts.map((p) => (
                    <div key={p._id} className="text-gray-700 truncate font-semibold" title={`${p.brand} ${p.name}`}>
                      • {p.brand} {p.name} {p.model ? `(${p.model})` : ''}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select an Action:</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                    <input
                      type="radio"
                      name="deleteAction"
                      checked={deleteAction === 'migrate'}
                      onChange={() => setDeleteAction('migrate')}
                      disabled={categories.filter((c) => c._id !== categoryToDelete?._id).length === 0}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Move products to another category</span>
                      <p className="text-xs text-muted-foreground">
                        Keep the products and transfer them to a different category.
                      </p>
                    </div>
                  </label>

                  {deleteAction === 'migrate' && (
                    <div className="pl-6 pb-2">
                      <select
                        value={migrationTargetId}
                        onChange={(e) => setMigrationTargetId(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select target category...</option>
                        {categories
                          .filter((c) => c._id !== categoryToDelete?._id)
                          .map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                      {categories.filter((c) => c._id !== categoryToDelete?._id).length === 0 && (
                        <p className="text-xs text-red-500 mt-1">No other categories available to migrate to.</p>
                      )}
                    </div>
                  )}

                  <label className="flex items-start gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-red-50/50 border border-transparent hover:border-red-100 transition-colors text-destructive">
                    <input
                      type="radio"
                      name="deleteAction"
                      checked={deleteAction === 'cascade'}
                      onChange={() => setDeleteAction('cascade')}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium text-destructive">Delete all associated products</span>
                      <p className="text-xs text-destructive/80">
                        Permanently delete both the category and all its {associatedProducts.length} products.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={associatedProducts.length > 0 && deleteAction === 'cascade' ? 'destructive' : 'default'}
              onClick={handleDeleteCategory}
              disabled={fetchingAssociated || (associatedProducts.length > 0 && deleteAction === 'none') || (associatedProducts.length > 0 && deleteAction === 'migrate' && !migrationTargetId)}
            >
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

