import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CustomFieldDefinition, CustomFieldType } from '@/types/tracker';

interface CustomFieldEditorProps {
    fields: CustomFieldDefinition[];
    onChange: (fields: CustomFieldDefinition[]) => void;
}

const TYPE_LABEL: Record<CustomFieldType, string> = {
    date: 'Date',
    number: 'Number',
    text: 'Text',
    checkbox: 'Checkbox',
};

function slugify(value: string): string {
    return (
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || 'field'
    );
}

function uniqueKey(
    base: string,
    fields: CustomFieldDefinition[],
    skipIndex: number,
): string {
    let candidate = base;
    let suffix = 1;
    while (
        fields.some(
            (field, idx) => idx !== skipIndex && field.key === candidate,
        )
    ) {
        candidate = `${base}_${suffix}`;
        suffix += 1;
    }
    return candidate;
}

export function CustomFieldEditor({
    fields,
    onChange,
}: CustomFieldEditorProps) {
    const updateField = (
        index: number,
        patch: Partial<CustomFieldDefinition>,
    ) => {
        const next = fields.map((field, idx) =>
            idx === index ? { ...field, ...patch } : field,
        );
        onChange(next);
    };

    const handleNameChange = (index: number, name: string) => {
        const field = fields[index];
        // Only auto-derive the storage key while it hasn't been set yet, so renaming
        // an already-saved field never breaks its stored dynamic_metadata mapping.
        const key =
            field.key === ''
                ? uniqueKey(slugify(name), fields, index)
                : field.key;
        updateField(index, { name, key });
    };

    const addField = () => {
        onChange([
            ...fields,
            {
                key: '',
                name: '',
                type: 'text',
                reminder: false,
                reminder_offset: 30,
            },
        ]);
    };

    const removeField = (index: number) => {
        onChange(fields.filter((_, idx) => idx !== index));
    };

    return (
        <div className="space-y-3">
            {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No custom fields defined for this category yet.
                </p>
            )}

            {fields.map((field, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-lg border border-border bg-muted/20 p-3"
                >
                    <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs">Field Name</Label>
                            <Input
                                value={field.name}
                                onChange={(e) =>
                                    handleNameChange(index, e.target.value)
                                }
                                placeholder="e.g. Expiry Date"
                            />
                        </div>
                        <div className="w-36 space-y-2">
                            <Label className="text-xs">Type</Label>
                            <Select
                                value={field.type}
                                onValueChange={(value) =>
                                    updateField(index, {
                                        type: value as CustomFieldType,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        Object.keys(
                                            TYPE_LABEL,
                                        ) as CustomFieldType[]
                                    ).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {TYPE_LABEL[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6"
                            onClick={() => removeField(index)}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </div>

                    {field.type === 'date' && (
                        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={field.reminder}
                                    onCheckedChange={(checked) =>
                                        updateField(index, {
                                            reminder: checked === true,
                                        })
                                    }
                                />
                                Enable automated reminders
                            </label>
                            {field.reminder && (
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs whitespace-nowrap">
                                        Days before
                                    </Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={field.reminder_offset}
                                        onChange={(e) =>
                                            updateField(index, {
                                                reminder_offset:
                                                    Number(e.target.value) || 1,
                                            })
                                        }
                                        className="w-20"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
            >
                <Plus className="size-4" />
                Add Custom Field
            </Button>
        </div>
    );
}
