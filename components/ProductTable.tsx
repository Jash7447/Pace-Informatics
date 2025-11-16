'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Edit, Trash2, ShoppingCart, PackagePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  _id: string;
  name: string;
  brand: string;
  model: string;
  stock: number;
  location: string;
  remarks?: string;
  category: {
    _id: string;
    name: string;
  };
}

interface ProductTableProps {
  selectedCategory: string | null;
  searchQuery: string;
  onProductChange?: () => void;
}

export default function ProductTable({ selectedCategory, searchQuery, onProductChange }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // For sell dialog
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingStockProduct, setAddingStockProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [addStockQuantity, setAddStockQuantity] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    stock: 0,
    location: '',
    remarks: '',
    category: '',
  });

  // Sell form state
  const [sellFormData, setSellFormData] = useState({
    category: '',
    productSearch: '',
    selectedProduct: '',
    quantity: 1,
  });

  const fetchProducts = async () => {
    try {
      const url = selectedCategory
        ? `/api/products?category=${selectedCategory}`
        : '/api/products';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch all products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0 && !formData.category && selectedCategory) {
          setFormData((prev) => ({ ...prev, category: selectedCategory }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: selectedCategory }));
    }
  }, [selectedCategory, categories]);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      stock: 0,
      location: '',
      remarks: '',
      category: selectedCategory || '',
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        model: product.model,
        stock: product.stock,
        location: product.location,
        remarks: product.remarks || '',
        category: product.category._id,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.brand ||
      !formData.model ||
      !formData.location ||
      !formData.category
    ) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        handleCloseDialog();
        fetchProducts();
        fetchAllProducts();
        onProductChange?.();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
        fetchAllProducts();
        onProductChange?.();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  // Filter products for sell dialog
  const getFilteredProductsForSell = () => {
    let filtered = allProducts;

    // Filter by category
    if (sellFormData.category) {
      filtered = filtered.filter(
        (p) => p.category._id === sellFormData.category
      );
    }

    // Filter by search text
    if (sellFormData.productSearch) {
      const searchLower = sellFormData.productSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.model.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const handleSellProduct = async () => {
    if (!sellFormData.selectedProduct || !sellFormData.quantity || sellFormData.quantity <= 0) {
      alert('Please select a product and enter a valid quantity');
      return;
    }

    const selectedProduct = allProducts.find(
      (p) => p._id === sellFormData.selectedProduct
    );

    if (!selectedProduct) {
      alert('Product not found');
      return;
    }

    if (selectedProduct.stock < sellFormData.quantity) {
      alert(`Insufficient stock! Available: ${selectedProduct.stock}`);
      return;
    }

    try {
      const newStock = selectedProduct.stock - sellFormData.quantity;
      
      // Extract category ID if it's an object, otherwise use the string directly
      const categoryId = typeof selectedProduct.category === 'object' 
        ? selectedProduct.category._id 
        : selectedProduct.category;
      
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          model: selectedProduct.model,
          stock: newStock,
          location: selectedProduct.location,
          remarks: selectedProduct.remarks || '',
          category: categoryId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully sold ${sellFormData.quantity} unit(s) of ${selectedProduct.name}`);
        setIsSellDialogOpen(false);
        setSellFormData({
          category: '',
          productSearch: '',
          selectedProduct: '',
          quantity: 1,
        });
        fetchProducts();
        fetchAllProducts();
        onProductChange?.();
      } else {
        alert(data.error || 'Failed to sell product');
      }
    } catch (error) {
      console.error('Failed to sell product:', error);
      alert('Failed to sell product');
    }
  };

  const handleOpenSellDialog = () => {
    setIsSellDialogOpen(true);
    setSellFormData({
      category: selectedCategory || '',
      productSearch: '',
      selectedProduct: '',
      quantity: 1,
    });
  };

  const handleOpenAddStockDialog = (product: Product) => {
    setAddingStockProduct(product);
    setAddStockQuantity(1);
    setIsAddStockDialogOpen(true);
  };

  const handleAddStock = async () => {
    if (!addingStockProduct || !addStockQuantity || addStockQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const newStock = addingStockProduct.stock + addStockQuantity;
      
      // Extract category ID if it's an object, otherwise use the string directly
      const categoryId = typeof addingStockProduct.category === 'object' 
        ? addingStockProduct.category._id 
        : addingStockProduct.category;
      
      const response = await fetch(`/api/products/${addingStockProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addingStockProduct.name,
          brand: addingStockProduct.brand,
          model: addingStockProduct.model,
          stock: newStock,
          location: addingStockProduct.location,
          remarks: addingStockProduct.remarks || '',
          category: categoryId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully added ${addStockQuantity} unit(s) to ${addingStockProduct.name}. New stock: ${newStock}`);
        setIsAddStockDialogOpen(false);
        setAddingStockProduct(null);
        setAddStockQuantity(1);
        fetchProducts();
        fetchAllProducts();
        onProductChange?.();
      } else {
        alert(data.error || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Failed to add stock:', error);
      alert('Failed to add stock');
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.model.toLowerCase().includes(searchLower) ||
      product.location.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold">Product List</h2>
        <div className="flex gap-2">
          <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleOpenSellDialog}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sell Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Sell Product</DialogTitle>
                <DialogDescription>
                  Select a product and enter the quantity to sell.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="sell-category" className="text-sm font-medium">
                    Category *
                  </label>
                  <select
                    id="sell-category"
                    value={sellFormData.category}
                    onChange={(e) =>
                      setSellFormData({
                        ...sellFormData,
                        category: e.target.value,
                        selectedProduct: '', // Reset product when category changes
                        productSearch: '', // Reset search when category changes
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sell-product" className="text-sm font-medium">
                    Select Product *
                  </label>
                  <select
                    id="sell-product"
                    value={sellFormData.selectedProduct}
                    onChange={(e) =>
                      setSellFormData({
                        ...sellFormData,
                        selectedProduct: e.target.value,
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a product</option>
                    {getFilteredProductsForSell().map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {product.brand} {product.model} (Stock: {product.stock})
                      </option>
                    ))}
                  </select>
                  {getFilteredProductsForSell().length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No products found. Try adjusting your search or category filter.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="sell-quantity" className="text-sm font-medium">
                    Quantity to Sell *
                  </label>
                  <Input
                    id="sell-quantity"
                    type="number"
                    min="1"
                    value={sellFormData.quantity}
                    onChange={(e) =>
                      setSellFormData({
                        ...sellFormData,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Enter quantity"
                  />
                  {sellFormData.selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      Available stock: {
                        allProducts.find((p) => p._id === sellFormData.selectedProduct)
                          ?.stock || 0
                      }
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSellDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSellProduct}>Sell Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
                <DialogDescription>
                  Increase the stock quantity for {addingStockProduct?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="current-stock" className="text-sm font-medium">
                    Current Stock
                  </label>
                  <Input
                    id="current-stock"
                    value={addingStockProduct?.stock || 0}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="add-quantity" className="text-sm font-medium">
                    Quantity to Add *
                  </label>
                  <Input
                    id="add-quantity"
                    type="number"
                    min="1"
                    value={addStockQuantity}
                    onChange={(e) => setAddStockQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Enter quantity to add"
                  />
                </div>
                {addingStockProduct && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium">New Stock:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {addingStockProduct.stock + addStockQuantity}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddStockDialogOpen(false);
                    setAddingStockProduct(null);
                    setAddStockQuantity(1);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddStock}>Add Stock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? 'Update the product information below.'
                  : 'Fill in the details to add a new product to your inventory.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium">
                    Brand *
                  </label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Enter brand"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="model" className="text-sm font-medium">
                    Model *
                  </label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Enter model"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium">
                    Stock *
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location *
                  </label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="remarks" className="text-sm font-medium">
                  Remarks
                </label>
                <Input
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional remarks or notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {searchQuery ? 'No products found matching your search.' : 'No products yet. Add one to get started!'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.model}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock === 0
                            ? 'destructive'
                            : product.stock < 10
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category.name}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.remarks || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenAddStockDialog(product)}
                          title="Add Stock"
                        >
                          <PackagePlus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(product)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product._id)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

