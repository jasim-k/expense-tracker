import { router, useForm } from '@inertiajs/react';
import { Loader2, Trash2 } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';
import { CustomFieldEditor } from '@/components/categories/custom-field-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';
import { destroy, store, update } from '@/routes/categories';
import type {
    CategoryNode,
    CategoryType,
    CustomFieldDefinition,
} from '@/types/tracker';

const EMOJI_CHOICES = [
    '🚗',
    '✈️',
    '🏠',
    '🍔',
    '🛒',
    '💊',
    '📄',
    '🛂',
    '🧾',
    '💼',
    '🎓',
    '🎮',
    '💡',
    '📱',
    '🏥',
    '🐾',
    '🛠️',
    '🧳',
    '🛡️',
    '💰',
];

const TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
    { value: 'asset_maintenance', label: 'Asset / Document Maintenance' },
];

interface CategoryFormData {
    name: string;
    type: CategoryType;
    icon_emoji: string;
    parent_id: number | null;
    custom_field_definitions: CustomFieldDefinition[];
}

interface CategoryDetailPanelProps {
    category: CategoryNode | null;
    parentOptions: CategoryNode[];
    defaultParentId: number | null;
    defaultType: CategoryType;
    stats?: { transactions: number; total: number };
    onSaved: () => void;
    onDeleted: () => void;
}

export function CategoryDetailPanel({
    category,
    parentOptions,
    defaultParentId,
    defaultType,
    stats,
    onSaved,
    onDeleted,
}: CategoryDetailPanelProps) {
    const isEdit = category !== null;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cascade, setCascade] = useState<'reassign' | 'delete'>('reassign');
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, errors } =
        useForm<CategoryFormData>({
            name: category?.name ?? '',
            type: category?.type ?? defaultType,
            icon_emoji: category?.icon_emoji ?? '🏷️',
            parent_id: category ? category.parent_id : defaultParentId,
            custom_field_definitions: category?.custom_field_definitions ?? [],
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit && category) {
            put(update.url(category.id), { onSuccess: onSaved });
        } else {
            post(store.url(), { onSuccess: onSaved });
        }
    };

    const handleDelete = () => {
        if (!category) {
            return;
        }
        setDeleting(true);
        router.delete(destroy.url(category.id), {
            data: { cascade },
            onSuccess: () => {
                setConfirmOpen(false);
                onDeleted();
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    {isEdit
                        ? 'Edit Category'
                        : defaultParentId
                          ? 'New Sub-category'
                          : 'New Category'}
                </CardTitle>
                {isEdit && stats && (
                    <span className="text-xs text-muted-foreground">
                        {stats.transactions} transactions ·{' '}
                        {formatCurrency(stats.total)}
                    </span>
                )}
            </CardHeader>
            <CardContent className="space-y-5">
                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">Name</Label>
                        <Input
                            id="category-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Emoji</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {EMOJI_CHOICES.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setData('icon_emoji', emoji)}
                                    className={`flex size-9 items-center justify-center rounded-md border text-lg ${
                                        data.icon_emoji === emoji
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:bg-accent'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(value) =>
                                    setData('type', value as CategoryType)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Parent Category</Label>
                            <Select
                                value={
                                    data.parent_id
                                        ? String(data.parent_id)
                                        : 'none'
                                }
                                onValueChange={(value) =>
                                    setData(
                                        'parent_id',
                                        value === 'none' ? null : Number(value),
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        None (top-level)
                                    </SelectItem>
                                    {parentOptions
                                        .filter(
                                            (parent) =>
                                                parent.id !== category?.id,
                                        )
                                        .map((parent) => (
                                            <SelectItem
                                                key={parent.id}
                                                value={String(parent.id)}
                                            >
                                                {parent.icon_emoji}{' '}
                                                {parent.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Dynamic Field Schema</Label>
                        <CustomFieldEditor
                            fields={data.custom_field_definitions}
                            onChange={(fields) =>
                                setData('custom_field_definitions', fields)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                        {isEdit ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setConfirmOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        ) : (
                            <span />
                        )}
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {isEdit ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </CardContent>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete "{category?.name}"?</DialogTitle>
                        <DialogDescription>
                            Choose what happens to its sub-categories and
                            transactions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
                            <input
                                type="radio"
                                name="cascade"
                                checked={cascade === 'reassign'}
                                onChange={() => setCascade('reassign')}
                                className="mt-1"
                            />
                            <span>
                                <span className="block font-medium">
                                    Move to Uncategorized
                                </span>
                                <span className="text-muted-foreground">
                                    Sub-categories and transactions are
                                    reassigned to "Uncategorized".
                                </span>
                            </span>
                        </label>
                        <label className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
                            <input
                                type="radio"
                                name="cascade"
                                checked={cascade === 'delete'}
                                onChange={() => setCascade('delete')}
                                className="mt-1"
                            />
                            <span>
                                <span className="block font-medium">
                                    Delete everything
                                </span>
                                <span className="text-muted-foreground">
                                    Permanently deletes sub-categories and their
                                    transactions.
                                </span>
                            </span>
                        </label>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
