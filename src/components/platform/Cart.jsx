"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Cart({ items = [], onRemoveItem }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-900">
        <CardContent className="py-6 text-center text-slate-400">
          Your cart is empty
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader>
        <CardTitle>Shopping Cart ({items.length} items)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-slate-400">${item.price}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-slate-700 pt-4">
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${total}</span>
          </div>
          <Button className="mt-3 w-full" size="sm">
            Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}