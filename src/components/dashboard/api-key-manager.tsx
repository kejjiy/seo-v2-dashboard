'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAPIKeys } from '@/hooks/use-api-keys';
import { Loader2, Key, Trash2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface APIKeyManagerProps {
    siteId: string;
}

export function APIKeyManager({ siteId }: APIKeyManagerProps) {
    const { keys, isLoading, createKey, isCreating, revokeKey } = useAPIKeys(siteId);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [newKeyName, setNewKeyName] = React.useState('');
    const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);
    const { toast } = useToast();
    const [copied, setCopied] = React.useState(false);

    const handleCreateKey = async () => {
        try {
            const result = await createKey(newKeyName);
            setGeneratedKey(result.plain_key);
            setNewKeyName('');
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Unable to create the API key.",
                variant: "destructive",
            });
        }
    };

    const handleCopy = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setGeneratedKey(null);
    };

    const handleRevoke = async (keyId: string) => {
        if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
            try {
                await revokeKey(keyId);
                toast({
                    title: "Success",
                    description: "API Key revoked successfully",
                });
            } catch (error: unknown) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Unable to revoke the API key.",
                    variant: "destructive",
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">API Keys</CardTitle>
                    <CardDescription>
                        Manage API keys to connect your WordPress site to the SEO-v2 engine.
                    </CardDescription>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                    setIsCreateModalOpen(open);
                    if (!open) setGeneratedKey(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="ml-auto">
                            <Key className="mr-2 h-4 w-4" />
                            Generate New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate API Key</DialogTitle>
                            <DialogDescription>
                                {generatedKey
                                    ? "Copy your API key now. For security reasons, it will not be shown again."
                                    : "Enter a name to identify this key (e.g., 'WordPress Main Site')."
                                }
                            </DialogDescription>
                        </DialogHeader>

                        {!generatedKey ? (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="key-name">Key Name</Label>
                                    <Input
                                        id="key-name"
                                        placeholder="My WP Plugin"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-2 p-3 bg-muted rounded-md border font-mono text-sm break-all">
                                    <span className="flex-1">{generatedKey}</span>
                                    <Button size="icon" variant="ghost" onClick={handleCopy}>
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-amber-500 font-medium">
                                    ⚠️ Warning: If you lose this key, you will need to generate a new one.
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            {!generatedKey ? (
                                <Button onClick={handleCreateKey} disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate
                                </Button>
                            ) : (
                                <Button onClick={handleCloseModal}>Done</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Prefix</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No API keys generated yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            keys?.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.name || "Unnamed Key"}</TableCell>
                                    <TableCell className="font-mono text-xs">{key.prefix}...</TableCell>
                                    <TableCell className="text-sm">
                                        {key.created_at ? new Date(key.created_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRevoke(key.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
