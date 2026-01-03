'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryTable } from './components/inventory-table';
import { ItemDialog } from './components/item-dialog';

import { useAuth } from '@/app/components/auth-provider';
import { canCreateInventory } from '@/lib/permissions';

export default function InventoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'SHOP' | 'REPAIR'>('SHOP');
  const { user } = useAuth();

  const handleAddItem = () => {
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Manage shop stock and repair parts inventory
          </p>
        </div>
        {canCreateInventory(user?.role) && (
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      <Tabs defaultValue="shop" className="space-y-4" onValueChange={(v) => setSelectedType(v as any)}>
        <TabsList>
          <TabsTrigger value="shop">Shop Stock</TabsTrigger>
          <TabsTrigger value="repair">Repair Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          <InventoryTable type="SHOP" />
        </TabsContent>

        <TabsContent value="repair" className="space-y-4">
          <InventoryTable type="REPAIR" />
        </TabsContent>
      </Tabs>

      <ItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={selectedType}
      />
    </div>
  );
}
