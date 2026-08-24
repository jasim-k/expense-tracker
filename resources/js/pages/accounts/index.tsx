import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatCurrency } from '@/lib/format';
import { destroy, index, store, update } from '@/routes/accounts';
import type { AccountSummary, AccountType } from '@/types/tracker';

interface AccountIndexProps {
    accounts: AccountSummary[];
}

interface AccountFormData {
    name: string;
    type: AccountType;
    icon_emoji: string;
    opening_balance: string;
}

const TYPE_LABEL: Record<AccountType, string> = {
    cash: 'Cash',
    bank: 'Bank',
    credit: 'Credit',
};

const EMOJI_CHOICES = ['💵', '🏦', '💳', '👛', '🪙', '💼'];

function AccountDialog({
    account,
    open,
    onOpenChange,
}: {
    account: AccountSummary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEdit = account !== null;
    const { data, setData, post, put, processing, errors, reset } =
        useForm<AccountFormData>({
            name: account?.name ?? '',
            type: account?.type ?? 'cash',
            icon_emoji: account?.icon_emoji ?? '💵',
            opening_balance: account ? String(account.opening_balance) : '0',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };
        if (isEdit && account) {
            put(update.url(account.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Account' : 'Add Account'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update this wallet or account.'
                            : 'Add a new cash wallet or bank account.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="account-name">Name</Label>
                        <Input
                            id="account-name"
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
                                    setData('type', value as AccountType)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        Object.keys(TYPE_LABEL) as AccountType[]
                                    ).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {TYPE_LABEL[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="opening-balance">
                                Opening Balance
                            </Label>
                            <Input
                                id="opening-balance"
                                type="number"
                                step="0.01"
                                value={data.opening_balance}
                                onChange={(e) =>
                                    setData('opening_balance', e.target.value)
                                }
                            />
                            {errors.opening_balance && (
                                <p className="text-sm text-destructive">
                                    {errors.opening_balance}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {isEdit ? 'Save Changes' : 'Add Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AccountIndex({ accounts }: AccountIndexProps) {
    const [dialogAccount, setDialogAccount] = useState<AccountSummary | null>(
        null,
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AccountSummary | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const openCreate = () => {
        setDialogAccount(null);
        setDialogOpen(true);
    };

    const openEdit = (account: AccountSummary) => {
        setDialogAccount(account);
        setDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!pendingDelete) {
            return;
        }
        setDeleting(true);
        router.delete(destroy.url(pendingDelete.id), {
            onFinish: () => {
                setDeleting(false);
                setPendingDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Accounts" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Accounts"
                        description="Manage the wallets and accounts you track transactions against."
                    />
                    <Button onClick={openCreate}>
                        <Plus className="size-4" />
                        Add Account
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <Card key={account.id}>
                            <CardContent className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-2xl leading-none"
                                            aria-hidden
                                        >
                                            {account.icon_emoji ?? '💳'}
                                        </span>
                                        <div>
                                            <div className="font-semibold">
                                                {account.name}
                                            </div>
                                            <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                {TYPE_LABEL[account.type]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEdit(account)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setPendingDelete(account)
                                            }
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Opening balance
                                    </span>
                                    <span>
                                        {formatCurrency(
                                            account.opening_balance,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-base font-semibold">
                                    <span className="text-sm font-normal text-muted-foreground">
                                        Current balance
                                    </span>
                                    <span>
                                        {formatCurrency(
                                            account.current_balance,
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <AccountDialog
                account={dialogAccount}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />

            <Dialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete "{pendingDelete?.name}"?
                        </DialogTitle>
                        <DialogDescription>
                            This account will be permanently removed. This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPendingDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AccountIndex.layout = {
    breadcrumbs: [{ title: 'Accounts', href: index() }],
};
