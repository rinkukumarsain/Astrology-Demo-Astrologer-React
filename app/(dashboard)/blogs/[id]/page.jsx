"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAPIAuth } from "@/lib/apiServices";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import toast from "react-hot-toast";

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    async function fetchBlog() {
      try {
        const response = await getAPIAuth(`${API_ENDPOINTS.GET_BLOG_DETAILS}/${params.id}`);
        if (response.data.status) {
          setBlog(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch blog details");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch blog details");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [params.id]);

  if (loading) {
    return <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#7A7A7A] shadow-sm">Loading blog details…</div>;
  }

  if (!blog) {
    return <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#7A7A7A] shadow-sm">Blog not found.</div>;
  }

  const imageUrl = getBackendImageUrl(blog.image);

  let toc = [];
  if (blog.tableOfContents) {
    if (typeof blog.tableOfContents === "string") {
      try {
        toc = JSON.parse(blog.tableOfContents);
      } catch (e) {
        toc = [];
      }
    } else if (Array.isArray(blog.tableOfContents)) {
      toc = blog.tableOfContents;
    }
  }

  return (
    <section className="space-y-6">
      {/* Header Back Button & Edit Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7A7A7A] hover:text-[#1F1F1F]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Blogs
        </button>

        <button
          onClick={() => router.push(`/blogs/add?editId=${blog._id}`)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E85B3F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#D44A2F]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>
          Edit Blog
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Title */}
        <div className="border-b border-[#EEE6ED] px-6 py-5">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">{blog.title}</h1>
          {blog.category && (
            <p className="mt-2 text-sm text-[#E85B3F] font-medium">{blog.category}</p>
          )}
        </div>

        <div className="p-6">
          {/* Image */}
          {imageUrl && (
            <div className="mb-8 overflow-hidden rounded-xl bg-[#F0EBF5]">
              <img src={imageUrl} alt={blog.title} className="h-auto w-full max-h-[400px] object-cover" />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-sm max-w-none text-[#333] mb-8" 
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />

          {/* Table of Contents */}
          {toc.length > 0 && (
            <div className="mt-8 border-t border-[#EEE6ED] pt-8">
              <h2 className="text-xl font-bold text-[#1F1F1F] mb-6">Table of Contents</h2>
              <div className="space-y-6">
                {toc.map((section, idx) => (
                  <div key={idx} className="rounded-xl border border-[#EEE6ED] p-5 bg-[#FAFAFA]">
                    {section.sectionTitle && (
                      <h3 className="text-lg font-semibold text-[#333] mb-3">
                        {section.sectionTitle}
                      </h3>
                    )}
                    {section.sectionContent && (
                      <div 
                        className="prose prose-sm max-w-none text-[#555]"
                        dangerouslySetInnerHTML={{ __html: section.sectionContent }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
