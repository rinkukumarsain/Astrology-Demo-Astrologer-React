"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { createBlog, editBlog, fetchBlogs } from "@/redux/slices/dashboardSlice";
import { uploadToS3 } from "@/lib/uploadToS3";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useRef } from "react";

const CATEGORIES = ["Astrology", "Health", "Horoscope", "Spirituality", "Lifestyle"];

export default function AddBlogPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const isSubmitting = useSelector((state) => state.dashboard.blogCreate.loading || state.dashboard.blogEdit.loading);
  const blogs = useSelector((state) => Array.isArray(state.dashboard.blogs.data) ? state.dashboard.blogs.data : []);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tableOfContents, setTableOfContents] = useState([{ sectionTitle: "", sectionContent: "" }]);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editId && blogs.length > 0) {
      const existing = blogs.find((b) => b._id === editId);
      if (existing) {
        setTitle(existing.title || "");
        setCategory(existing.category || CATEGORIES[0]);
        setContent(existing.content || "");
        if (existing.image) {
          setImagePreview(getBackendImageUrl(existing.image));
        }
        if (existing.tableOfContents) {
          let toc = existing.tableOfContents;
          if (typeof toc === "string") {
            try {
              toc = JSON.parse(toc);
            } catch (e) {
              toc = [];
            }
          }
          if (Array.isArray(toc) && toc.length > 0) {
            setTableOfContents(toc);
          }
        }
      }
    }
  }, [editId, blogs]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (status) => {
    if (!title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Blog content is required");
      return;
    }

    const validSections = tableOfContents.filter(
      (section) =>
        (section?.sectionTitle || "").trim() && (section?.sectionContent || "").trim()
    );

    if (validSections.length === 0) {
      toast.error("At least one table of contents section is required");
      return;
    }

    let imageKey = "";

    if (imageFile) {
      setUploading(true);
      try {
        imageKey = await uploadToS3(imageFile);
      } catch {
        toast.error("Image upload failed. Please try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category,
      status,
      tableOfContents: JSON.stringify(validSections),
      ...(imageKey ? { image: imageKey } : {}),
    };

    try {
      let result;
      if (editId) {
        result = await dispatch(editBlog({ blogId: editId, payload })).unwrap();
      } else {
        result = await dispatch(createBlog(payload)).unwrap();
      }
      toast.success(result?.message || "Blog saved successfully");
      void dispatch(fetchBlogs()); // refresh list
      router.push("/blogs");
    } catch (errMsg) {
      toast.error(errMsg || "Unable to save blog");
    }
  };

  const busy = isSubmitting || uploading;

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      {/* Back */}
      <div className="mb-4">
        <Link href="/blogs" className="inline-flex items-center text-[#2F2F2F]">
          <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <h2 className="mb-4 text-base font-semibold text-[#1F1F1F]">
        {editId ? "Edit Blog" : "Add New Blog"}
      </h2>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333]">Blog Title</label>
            <input
              type="text"
              placeholder="e.g. 'Understanding Saturn Return'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none focus:border-primary"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Featured Image</label>
          <label className="relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D3CCD9] bg-[#FCFBFD] text-center">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Selected blog" className="h-full w-full rounded-xl object-contain" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/70"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <span className="inline-flex h-8 w-8 items-center justify-center text-[#94909A]">
                  <svg className="h-6 w-6" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="m8 13 2.5-2.5L14 14l2-2 3 3M16 8h.01M19 3v4M17 5h4" />
                  </svg>
                </span>
                <p className="mt-2 text-sm font-semibold text-[#4A4A4F]">Upload an image</p>
                <p className="text-xs text-[#8B8B96]">Tap to select a file from your device</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {uploading && (
            <p className="mt-1 text-xs text-primary">Uploading image to S3…</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Blog Content</label>
          <div className="prose max-w-none border border-[#D9D2DE] rounded-lg overflow-hidden">
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onReady={(editor) => {
                editorRef.current = editor;
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                setContent(data);
              }}
              config={{
                toolbar: [
                  "heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "outdent", "indent", "|", "blockQuote", "insertTable", "|", "undo", "redo"
                ],
              }}
            />
          </div>
        </div>

        {/* Table of Contents */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Table of Contents</label>
          <div className="space-y-4">
            {tableOfContents.map((section, index) => (
              <div key={index} className="rounded-xl border border-[#D3CCD9] p-4 bg-[#FCFBFD]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#1F1F1F]">Section {index + 1}</span>
                  {tableOfContents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSections = tableOfContents.filter((_, i) => i !== index);
                        setTableOfContents(newSections);
                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={section.sectionTitle}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setTableOfContents((prev) =>
                        prev.map((sec, i) => (i === index ? { ...sec, sectionTitle: newVal } : sec))
                      );
                    }}
                    className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#7A7A7A]">Section Content</label>
                  <div className="prose max-w-none border border-[#D9D2DE] rounded-lg overflow-hidden">
                    <CKEditor
                      editor={ClassicEditor}
                      data={section.sectionContent}
                      onChange={(event, editor) => {
                        const editorData = editor.getData();
                        setTableOfContents((prev) =>
                          prev.map((sec, i) => (i === index ? { ...sec, sectionContent: editorData } : sec))
                        );
                      }}
                      config={{
                        toolbar: [
                          "heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "outdent", "indent", "|", "blockQuote", "|", "undo", "redo"
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setTableOfContents([...tableOfContents, { sectionTitle: "", sectionContent: "" }]);
              }}
              className="mt-2 text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              + Add Section
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleSubmit("draft")}
            className="h-11 rounded-xl border border-primary/35 bg-white text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving…" : "Draft"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleSubmit("published")}
            className="h-11 rounded-xl bg-primary text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving…" : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}
 