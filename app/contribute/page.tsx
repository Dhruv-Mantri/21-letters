"use client";

import { useState, useCallback, ChangeEvent, FormEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabase";

export default function ContributePage() {
  const [name, setName] = useState("");
  const [letter, setLetter] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle image selection
  const processFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !letter || !imageFile) {
      setError("Please fill out all fields and upload a photo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Generate unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("birthday-photos")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

      // 3. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("birthday-photos").getPublicUrl(filePath);

      // 4. Insert into database
      const { error: dbError } = await supabase.from("wishes").insert([
        {
          contributor: name,
          letter: letter,
          image_url: publicUrl,
        },
      ]);

      if (dbError) throw new Error(`Database save failed: ${dbError.message}`);

      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── SUCCESS STATE ───
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
        style={{ backgroundColor: "#fefaf6" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white p-10 rounded-2xl shadow-lg max-w-md border border-stone-100"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-5xl block"
          >
            🎉
          </motion.span>
          <h1 className="text-2xl font-semibold text-stone-800 mt-5">
            Thank you so much!
          </h1>
          <p className="text-stone-500 mt-3 leading-relaxed">
            Your letter and photo have been safely added to the wishing well. It
            will unlock on her birthday!
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
          />
        </motion.div>
      </div>
    );
  }

  // ─── FORM STATE ───
  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center"
      style={{ backgroundColor: "#fefaf6" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-stone-100"
      >
        {/* Header */}
        <header className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-stone-900"
          >
            Write a Birthday Note for Chinmayi{" "}
            <span className="inline-block animate-float">✨</span>
          </motion.h1>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            Leave a heartfelt letter and a picture of you with her, for her to unlock on her birthday.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Field */}
          <div>
            <label
              htmlFor="contribute-name"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Your Name
            </label>
            <input
              id="contribute-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., Aria, Mom. Optionally list your title (e.g. First Girlfriend, Second Girlfriend, Ex-Girlfriend, etc)'
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                text-stone-800 text-sm placeholder:text-stone-300
                transition-all duration-200"
            />
          </div>

          {/* Letter/Message Field */}
          <div>
            <label
              htmlFor="contribute-letter"
              className="block text-sm font-medium text-stone-700 mb-1.5"
            >
              Your Birthday Message
            </label>
            <textarea
              id="contribute-letter"
              required
              rows={6}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Write your letter or favorite memory here..."
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                text-stone-800 text-sm placeholder:text-stone-300 resize-none
                transition-all duration-200"
            />
          </div>

          {/* File Upload with Drag & Drop */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Upload a Photo
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6
                border-2 border-dashed rounded-xl transition-all duration-200 relative
                ${
                  isDragging
                    ? "border-amber-400 bg-amber-50/50 scale-[1.02]"
                    : "border-stone-200 hover:border-stone-300"
                }`}
            >
              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-44 rounded-lg mb-3 mx-auto shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-500 hover:underline transition-colors"
                    >
                      Remove and select another
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2 text-center"
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-stone-300"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-stone-500 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-amber-600 hover:text-amber-500 transition-colors"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-stone-400">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl
              shadow-md text-sm font-semibold text-white
              bg-gradient-to-r from-amber-500 to-amber-600
              hover:from-amber-600 hover:to-amber-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Sending to the well...
              </span>
            ) : (
              "Submit Message"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}