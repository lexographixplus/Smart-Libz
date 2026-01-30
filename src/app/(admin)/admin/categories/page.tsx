import CategoryManager from "@/components/admin/CategoryManager";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Categories - Resource Hub Admin",
};

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-500">Organize your resources with clear categories.</p>

            <CategoryManager />
        </div>
    );
}
