"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchBlogs, deleteBlog } from "@/redux/slices/dashboardSlice";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import DeleteModal from "@/components/common/DeleteModal";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "published", label: "Published" },
];

function formatDate(raw) {
  if (!raw) return "-";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function BlogCard({ blog, onDelete }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const imageUrl = getBackendImageUrl(blog.image);
  const isPublished = blog.status === "published";

  return (
    <div 
      onClick={() => router.push(`/blogs/${blog._id}`)}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#EEE6ED] bg-white px-4 py-3 shadow-sm transition-all hover:border-[#E85B3F]/30 hover:shadow-md"
    >
      {/* Thumbnail */}
      <span className="inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F0EBF5]">
        {imageUrl ? (
          <img src={imageUrl} alt={blog.title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[#B0A0BC]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m8 13 2.5-2.5L14 14l2-2 3 3M16 8h.01M19 3v4M17 5h4" />
            </svg>
          </span>
        )}
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#1F1F1F]">{blog.title}</p>
        <p className="mt-0.5 text-xs text-[#7A7A7A]">
          {formatDate(blog.createdAt)}
          {blog.category ? ` · ${blog.category}` : ""}
        </p>
        <span
          className={[
            "mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
            isPublished
              ? "bg-[#E6F4EA] text-[#2E7D32]"
              : "bg-[#FFF8E1] text-[#F57F17]",
          ].join(" ")}
        >
          {blog.status || "draft"}
        </span>
      </div>

      {/* 3-dot menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#888] hover:bg-[#F5F0FA] hover:text-[#5D5D5D]"
          aria-label="More options"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 min-w-[130px] overflow-hidden rounded-xl border border-[#EEE6ED] bg-white shadow-lg">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                router.push(`/blogs/${blog._id}`);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#333] hover:bg-[#F5F0FA]"
            >
              <svg className="h-3.5 w-3.5 text-[#555]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              View
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                router.push(`/blogs/add?editId=${blog._id}`);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#333] hover:bg-[#F5F0FA]"
            >
              <svg className="h-3.5 w-3.5 text-[#555]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
              </svg>
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(blog);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#D6455B] hover:bg-[#FFF3F5]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogsPage() {
  const dispatch = useDispatch();
  const blogsState = useSelector((state) => state.dashboard.blogs);
  const isDeleting = useSelector((state) => state.dashboard.blogDelete.loading);
  const [activeFilter, setActiveFilter] = useState("all");
  const [blogToDelete, setBlogToDelete] = useState(null);

  const isLoading = blogsState.loading;
  const error = blogsState.error;
  const allBlogs = Array.isArray(blogsState.data) ? blogsState.data : [];

  useEffect(() => {
    void dispatch(fetchBlogs());
  }, [dispatch]);

  const filteredBlogs = allBlogs.filter((b) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "draft") return b.status === "draft";
    if (activeFilter === "published") return b.status === "published";
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!blogToDelete?._id) return;
    try {
      const result = await dispatch(deleteBlog(blogToDelete._id)).unwrap();
      toast.success(result?.message || "Blog deleted successfully");
      setBlogToDelete(null);
      void dispatch(fetchBlogs());
    } catch (errMsg) {
      toast.error(errMsg || "Unable to delete blog");
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      {/* <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-[#1F1F1F]">Blogs</h1>
          <p className="text-xs text-[#7A7A7A]">Manage and publish your blog posts.</p>
        </div>
      </div> */}

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const selected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={[
                "inline-flex h-8 cursor-pointer items-center rounded-full border px-3.5 text-xs font-medium transition-colors",
                selected
                  ? "border-[#E86C45] bg-[#E86C45] text-white"
                  : "border-[#E3DEE7] bg-white text-[#5D5D5D] hover:border-[#D2CBD8]",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-xl bg-[#FFF1F1] px-4 py-3 text-sm text-[#B42318]">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-[#7A7A7A] shadow-sm">
          Loading blogs…
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#7A7A7A] shadow-sm">
          No blogs found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} onDelete={setBlogToDelete} />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteModal
        isOpen={!!blogToDelete}
        onClose={() => setBlogToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={<>Are you sure, You want to
delete this blog?</>}
      />

      {/* Floating Create New button */}
      <Link
        href="/blogs/add"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 inline-flex items-center gap-1.5 rounded-full bg-[#E85B3F] px-5 py-3 text-[15px] font-semibold text-white shadow-xl transition-transform hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Create New
      </Link>
    </section>
  );
}

 