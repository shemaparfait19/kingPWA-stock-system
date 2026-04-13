'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Building2 } from 'lucide-react';
import { InventoryTable } from './components/inventory-table';
import { ItemDialog } from './components/item-dialog';
import { useAuth } from '@/app/components/auth-provider';
import { useTranslations } from 'next-intl';

interface Branch {
  id: string;
  name: string;
  location?: string;
}

export default function InventoryPage() {
  const t = useTranslations('inventory');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'SHOP' | 'REPAIR'>('SHOP');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const { user } = useAuth();

  const isOwner = user?.role === 'owner';

  // Fetch branches so owner can filter by them
  useEffect(() => {
    if (!isOwner) return;
    fetch('/api/branches')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
      })
      .catch(console.error);
  }, [isOwner]);

  const handleAddItem = () => {
    setDialogOpen(true);
  };

  // The branchId passed to the table: undefined for non-owners (they use their own branch server-side)
  // For owners: 'all' or a specific id.
  const tableBranchId = isOwner ? selectedBranch : undefined;

  const selectedBranchLabel =
    selectedBranch === 'all'
      ? 'All Branches'
      : branches.find((b) => b.id === selectedBranch)?.name ?? 'Branch';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          {isOwner && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Viewing: <span className="font-medium text-foreground">{selectedBranchLabel}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Branch filter — owner only */}
          {isOwner && branches.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                      {branch.location ? ` — ${branch.location}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(user?.role === 'owner' || user?.role === 'manager' || user?.role === 'sales') && (
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addItem')}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="shop" className="space-y-4" onValueChange={(v) => setSelectedType(v as any)}>
        <TabsList>
          <TabsTrigger value="shop">{t('title')} - Shop</TabsTrigger>
          <TabsTrigger value="repair">{t('title')} - Repair</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          <InventoryTable type="SHOP" branchId={tableBranchId} />
        </TabsContent>

        <TabsContent value="repair" className="space-y-4">
          <InventoryTable type="REPAIR" branchId={tableBranchId} />
        </TabsContent>
      </Tabs>

      <ItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={selectedType}
        onSuccess={() => setDialogOpen(false)}
      />
    </div>
  );
}
