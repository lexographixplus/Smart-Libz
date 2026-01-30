"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthProvider";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Trash2, Plus, Tag } from "lucide-react";

interface Category {
    id: string;
    name: string;
    description: string;
}

export default function CategoryManager() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchCategories = async () => {
        if (!user?.organizationId) return;
        setFetching(true);
        try {
            const q = query(
                collection(db, "categories"),
                where("organizationId", "==", user.organizationId)
                // orderBy requires index, omitting for now or assuming default id sort
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [user?.organizationId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "categories"), {
                organizationId: user.organizationId,
                name,
                description,
                createdAt: serverTimestamp()
            });
            setName("");
            setDescription("");
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Error creating category:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await deleteDoc(doc(db, "categories", id));
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Create Form */}
            <Card className="h-fit p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Category
                </h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g., Marketing"
                    />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>
                    <Button type="submit" isLoading={loading} className="w-full">
                        Create Category
                    </Button>
                </form>
            </Card>

            {/* List */}
            <Card className="h-fit p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Existing Categories
                </h2>

                {fetching ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : categories.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No categories created yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <li key={category.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-gray-900">{category.name}</p>
                                    {category.description && (
                                        <p className="text-xs text-gray-500">{category.description}</p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(category.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
