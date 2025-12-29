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
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

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
    if (!selectedItem) {
      toast({
        title: 'Select a part',
        description: 'Please select an item from inventory',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/repairs/${repair.id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem,
          quantity,
        }),
      });

      if (!response.ok) throw new Error('Failed to add part');

      toast({
        title: 'Part added',
        description: 'Part has been added to repair job',
      });

      setSelectedItem('');
      setQuantity(1);
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
    (sum: number, part: any) => sum + part.unitCost * part.quantity,
    0
  ) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parts Used</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Part Form */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select part..." />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.sellingPrice)} ({item.quantity} in stock)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-20"
          />
          <Button onClick={handleAddPart} disabled={loading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Parts List */}
        <div className="space-y-2">
          {repair.partsUsed && repair.partsUsed.length > 0 ? (
            <>
              {repair.partsUsed.map((part: any) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{part.item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(part.unitCost)} × {part.quantity} = {formatCurrency(part.unitCost * part.quantity)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePart(part.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-medium">
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
