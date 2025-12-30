'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PartsUsedProps {
  repair: any;
  onUpdate: () => void;
}

export function PartsUsed({ repair, onUpdate }: PartsUsedProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  // Form State
  const [partType, setPartType] = useState<'stock' | 'external'>('stock');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleAddPart = async () => {
    // Validation
    if (partType === 'stock' && !selectedItem) {
      toast({ title: 'Error', description: 'Select a part from inventory', variant: 'destructive' });
      return;
    }
    if (partType === 'external' && (!customName || !customCost)) {
      toast({ title: 'Error', description: 'Enter name and cost for external part', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = partType === 'stock' 
        ? { itemId: selectedItem, quantity: Number(quantity) }
        : { name: customName, unitCost: Number(customCost), quantity: Number(quantity) };

      const response = await fetch(`/api/repairs/${repair.id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to add part');

      toast({
        title: 'Part added',
        description: 'Part has been added to repair job',
      });

      // Reset form
      setSelectedItem('');
      setQuantity(1);
      setCustomName('');
      setCustomCost('');
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePart = async (partId: string) => {
    try {
      const response = await fetch(`/api/repairs/${repair.id}/parts/${partId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove part');

      toast({
        title: 'Part removed',
        description: 'Part has been removed from repair job',
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const totalPartsCost = repair.partsUsed?.reduce(
    (sum: number, part: any) => sum + (part.totalCost || (part.unitCost * part.quantity)),
    0
  ) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parts Used</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Type */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg w-fit">
          <Button 
            variant={partType === 'stock' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setPartType('stock')}
          >
            From Stock
          </Button>
          <Button 
            variant={partType === 'external' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setPartType('external')}
          >
            External / Custom
          </Button>
        </div>

        {/* Add Part Form */}
        <div className="flex flex-wrap gap-2 items-end">
          {partType === 'stock' ? (
            <div className="flex-1 min-w-[200px]">
              <Label>Select Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select part..." />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.sellingPrice)} ({item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
               <div className="flex-1 min-w-[150px]">
                <Label>Part Name</Label>
                <Input 
                  value={customName} 
                  onChange={(e) => setCustomName(e.target.value)} 
                  placeholder="e.g. Purchased Screen"
                />
               </div>
               <div className="w-[120px]">
                <Label>Unit Cost</Label>
                <Input 
                  type="number" 
                  value={customCost} 
                  onChange={(e) => setCustomCost(e.target.value)} 
                  placeholder="0.00"
                />
               </div>
            </>
          )}

          <div className="w-20">
             <Label>Qty</Label>
             <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>
          
          <Button onClick={handleAddPart} disabled={loading} className="mb-[2px]">
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>

        {/* Parts List */}
        <div className="space-y-2 pt-2">
          {repair.partsUsed && repair.partsUsed.length > 0 ? (
            <>
              {repair.partsUsed.map((part: any) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                         <span className="font-medium">
                            {part.item ? part.item.name : part.customName}
                         </span>
                         {!part.item && <span className="text-xs bg-muted px-2 py-0.5 rounded">External</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(part.unitCost)} × {part.quantity} = {formatCurrency(part.totalCost || (part.unitCost * part.quantity))}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePart(part.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total Parts Cost:</span>
                <span>{formatCurrency(totalPartsCost)}</span>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No parts added yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
