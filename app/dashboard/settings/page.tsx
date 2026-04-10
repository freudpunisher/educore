"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Building2, Users, Bell, Shield, Save, Package, Tag, Ruler, Plus, Pencil, Trash2
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type Product = {
  id: number
  name: string
  category: number
  category_name: string
  category_type: string
  unit: number
  unit_name: string
  unit_symbol: string
  minimum_stock: number
  is_active: boolean
}

type Category = {
  id: number
  name: string
  type: "vivre" | "non_vivre"
}

type Unit = {
  id: number
  name: string
  symbol: string
}

const staticUsers = [
  { id: "1", name: "Marie Dubois", email: "marie.dubois@school.fr", role: "Admin", status: "active" },
  { id: "2", name: "Jean Martin", email: "jean.martin@school.fr", role: "Teacher", status: "active" },
  { id: "3", name: "Pierre Leroy", email: "pierre.leroy@school.fr", role: "Driver", status: "active" },
  { id: "4", name: "Sophie Bernard", email: "sophie.bernard@school.fr", role: "Parent", status: "active" },
]

export default function SettingsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)

  const fetchData = async () => {
    try {
      const [pRes, cRes, uRes] = await Promise.all([
        api.get<any>("store/stock/products/"),
        api.get<any>("store/stock/categories/"),
        api.get<any>("store/stock/units/"),
      ])
      setProducts(Array.isArray(pRes) ? pRes : pRes.results || [])
      setCategories(Array.isArray(cRes) ? cRes : cRes.results || [])
      setUnits(Array.isArray(uRes) ? uRes : uRes.results || [])
    } catch {
      toast.error("Failed to load store data")
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get("name"),
      category: parseInt(fd.get("category") as string),
      unit: parseInt(fd.get("unit") as string),
      minimum_stock: parseFloat(fd.get("minimum_stock") as string) || 0,
      is_active: fd.get("is_active") === "true",
    }
    try {
      editingProduct
        ? await api.put(`store/stock/products/${editingProduct.id}/`, data)
        : await api.post("store/stock/products/", data)
      toast.success(editingProduct ? "Article updated" : "Article created")
      setIsProductModalOpen(false)
      fetchData()
    } catch { toast.error("Operation failed") }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this article?")) return
    try { await api.delete(`store/stock/products/${id}/`); toast.success("Deleted"); fetchData() }
    catch { toast.error("Failed") }
  }

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = { name: fd.get("name"), type: fd.get("type") }
    try {
      editingCategory
        ? await api.put(`store/stock/categories/${editingCategory.id}/`, data)
        : await api.post("store/stock/categories/", data)
      toast.success(editingCategory ? "Category updated" : "Category created")
      setIsCategoryModalOpen(false)
      fetchData()
    } catch { toast.error("Operation failed") }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return
    try { await api.delete(`store/stock/categories/${id}/`); toast.success("Deleted"); fetchData() }
    catch { toast.error("Failed") }
  }

  const handleUnitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = { name: fd.get("name"), symbol: fd.get("symbol") }
    try {
      editingUnit
        ? await api.put(`store/stock/units/${editingUnit.id}/`, data)
        : await api.post("store/stock/units/", data)
      toast.success(editingUnit ? "Unit updated" : "Unit created")
      setIsUnitModalOpen(false)
      fetchData()
    } catch { toast.error("Operation failed") }
  }

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("Delete this unit?")) return
    try { await api.delete(`store/stock/units/${id}/`); toast.success("Deleted"); fetchData() }
    catch { toast.error("Failed") }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage school settings, store catalog and permissions</p>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="school"><Building2 className="w-4 h-4 mr-2" />School</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="articles"><Package className="w-4 h-4 mr-2" />Articles</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-2" />Categories</TabsTrigger>
          <TabsTrigger value="units"><Ruler className="w-4 h-4 mr-2" />Units</TabsTrigger>
        </TabsList>

        {/* ── School ── */}
        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Manage general information about your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>School Name</Label><Input defaultValue="Saint-Martin Primary School" /></div>
                <div className="space-y-2"><Label>School Code</Label><Input defaultValue="ESM-2024" /></div>
                <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input defaultValue="123 Education Street, 75001 Paris" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input type="tel" defaultValue="01 23 45 67 89" /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue="contact@ecole-saint-martin.fr" /></div>
                <div className="space-y-2"><Label>Director</Label><Input defaultValue="Mrs Catherine Dubois" /></div>
                <div className="space-y-2"><Label>Academic Year</Label><Input defaultValue="2024-2025" /></div>
              </div>
              <div className="flex justify-end">
                <Button><Save className="w-4 h-4 mr-2" />Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Users ── */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>User Management</CardTitle><CardDescription>Manage accounts and permissions</CardDescription></div>
                <Button>Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead>
                      <TableHead>Role</TableHead><TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staticUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell><Badge variant={u.status === "active" ? "default" : "secondary"}>{u.status === "active" ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New Enrollments", desc: "Receive an email for new registrations", checked: true },
                { label: "Payments Received", desc: "Notification upon receiving a payment", checked: true },
                { label: "Absences", desc: "Alert for unjustified absences", checked: true },
                { label: "Transport Delays", desc: "Notification for travel delays", checked: false },
              ].map((n, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div><Label>{n.label}</Label><p className="text-sm text-muted-foreground">{n.desc}</p></div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                  {i < 3 && <Separator className="mt-3" />}
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button><Save className="w-4 h-4 mr-2" />Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ── */}
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security and Privacy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Minimum Password Length</Label><p className="text-sm text-muted-foreground">Minimum characters required</p></div>
                <Input type="number" defaultValue="8" className="w-20" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div><Label>Two-Factor Authentication</Label><p className="text-sm text-muted-foreground">Enable 2FA for administrators</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end pt-2">
                <Button><Save className="w-4 h-4 mr-2" />Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Articles ── */}
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Articles (Products)</CardTitle><CardDescription>Store products with category and unit</CardDescription></div>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />New Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead>
                      <TableHead>Unit</TableHead><TableHead>Min Stock</TableHead><TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0
                      ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No articles found</TableCell></TableRow>
                      : products.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.category_name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={p.category_type === "vivre" ? "border-green-500 text-green-700" : "border-purple-500 text-purple-700"}>
                              {p.category_type === "vivre" ? "Food" : "Equipment"}
                            </Badge>
                          </TableCell>
                          <TableCell>{p.unit_name} ({p.unit_symbol})</TableCell>
                          <TableCell>{p.minimum_stock} {p.unit_symbol}</TableCell>
                          <TableCell><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(p); setIsProductModalOpen(true) }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Categories ── */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Categories</CardTitle><CardDescription>Product categories: food or equipment</CardDescription></div>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />New Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Articles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0
                      ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No categories found</TableCell></TableRow>
                      : categories.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={c.type === "vivre" ? "border-green-500 text-green-700" : "border-purple-500 text-purple-700"}>
                              {c.type === "vivre" ? "Food" : "Equipment"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{products.filter(p => p.category === c.id).length} articles</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(c); setIsCategoryModalOpen(true) }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCategory(c.id)}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Units ── */}
        <TabsContent value="units">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Units of Measure</CardTitle><CardDescription>kg, litre, piece, etc.</CardDescription></div>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />New Unit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Symbol</TableHead><TableHead>Articles using it</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.length === 0
                      ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No units found</TableCell></TableRow>
                      : units.map(u => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell><Badge variant="outline">{u.symbol}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{products.filter(p => p.unit === u.id).length} articles</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingUnit(u); setIsUnitModalOpen(true) }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteUnit(u.id)}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Article Modal ── */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProduct ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input name="name" defaultValue={editingProduct?.name} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category" defaultValue={editingProduct ? String(editingProduct.category) : undefined}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select name="unit" defaultValue={editingProduct ? String(editingProduct.unit) : undefined}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{units.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.symbol})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Stock</Label><Input name="minimum_stock" type="number" step="0.1" defaultValue={editingProduct?.minimum_stock ?? 0} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="is_active" defaultValue={String(editingProduct?.is_active ?? true)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button type="submit">{editingProduct ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Category Modal ── */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input name="name" defaultValue={editingCategory?.name} required /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select name="type" defaultValue={editingCategory?.type ?? "vivre"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivre">Food (Vivre)</SelectItem>
                  <SelectItem value="non_vivre">Equipment (Non-Vivre)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit">{editingCategory ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Unit Modal ── */}
      <Dialog open={isUnitModalOpen} onOpenChange={setIsUnitModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingUnit ? "Edit Unit" : "New Unit"}</DialogTitle></DialogHeader>
          <form onSubmit={handleUnitSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input name="name" defaultValue={editingUnit?.name} placeholder="e.g. Kilogram" required /></div>
            <div className="space-y-2"><Label>Symbol</Label><Input name="symbol" defaultValue={editingUnit?.symbol} placeholder="e.g. kg" required /></div>
            <DialogFooter><Button type="submit">{editingUnit ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
