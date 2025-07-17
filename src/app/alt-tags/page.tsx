"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useEffect, useState } from "react"
import apiClient from "@/lib/api/axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Loader2, Save } from "lucide-react"

type ImageItem = {
  _id: string
  url: string
  altText?: string
  description?: string
  suggestedAlt?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

export default function AltTagsPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)

  // 🔄 Load images without ALT text
  const fetchImages = async () => {
    try {
      const res = await apiClient.get("/image/no-alt")
      setImages(res.data.data)
    } catch (err) {
      toast.error("Failed to load images")
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  // 🧠 Generate ALT tags
  const handleGenerate = async () => {
    const descriptions = images.map((img) => img.description?.trim() || "Image with no description")

    if (descriptions.some((desc) => desc.length < 5)) {
      return toast.warning("Please enter descriptions with at least 5 characters for all images.")
    }

    setLoadingGenerate(true)
    try {
      const res = await apiClient.post("/image/alt-tags", {
        imageDescriptions: descriptions,
      })

      const optimized = res.data.data.optimizedAltTags
      const updatedImages = images.map((img, idx) => ({
        ...img,
        suggestedAlt: optimized[idx],
      }))
      setImages(updatedImages)
      toast.success("ALT tags generated!")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate ALT tags")
    } finally {
      setLoadingGenerate(false)
    }
  }

  // 💾 Save generated ALT tags
  const handleSaveAllAltTags = async () => {
    setLoadingSave(true)
    try {
      const imagesToUpdate = images.filter((img) => img.suggestedAlt && img.altText !== img.suggestedAlt)

      if (imagesToUpdate.length === 0) {
        toast.info("No new ALT tags to save.")
        setLoadingSave(false)
        return
      }

      // Use Promise.all to send multiple patch requests concurrently
      await Promise.all(
        imagesToUpdate.map((img) => apiClient.patch(`/image/update-alt/${img._id}`, { altText: img.suggestedAlt })),
      )

      toast.success("All generated ALT tags saved successfully!")
      fetchImages() // Refresh the list after saving
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save ALT tags.")
    } finally {
      setLoadingSave(false)
    }
  }

  // 📤 Handle image upload
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fileInput = form.image as HTMLInputElement
    const descriptionInput = form.description as HTMLTextAreaElement

    if (!fileInput.files?.[0]) {
      return toast.warning("Please select an image to upload")
    }

    const formData = new FormData()
    formData.append("image", fileInput.files[0])
    formData.append("description", descriptionInput.value)

    try {
      const res = await apiClient.post("/image/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Image uploaded")
      form.reset()

      // Immediately add the newly uploaded image to the state
      const newImage = res.data.data
      setImages((prevImages) => [newImage, ...prevImages])

      // Re-fetch the full list to ensure consistency with backend's limit and sorting
      await fetchImages()
    } catch (err) {
      toast.error("Upload failed")
    }
  }

  const hasSuggestedAltTags = images.some((img) => img.suggestedAlt)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Header */}
      <header className="flex items-center justify-center py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SEO BoostPro
        </span>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full space-y-8 pb-8">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Image ALT Tag Suggestions</CardTitle>
            <CardDescription>Upload images, describe them, and generate SEO-optimized ALT text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 📤 Upload Form */}
            <Card className="p-4 shadow-sm">
              <CardTitle className="text-lg mb-4">Upload New Image</CardTitle>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Image File</Label>
                  <Input id="image-upload" type="file" name="image" accept="image/*" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-description">Description</Label>
                  <Textarea id="image-description" name="description" placeholder="Describe this image (optional)" />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Upload Image
                </Button>
              </form>
            </Card>

            {/* Image Grid */}
            {images.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No images found without ALT text. Upload some to get started!
              </p>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center">Images Needing ALT Tags</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((img, idx) => (
                    <Card key={img._id} className="p-4 shadow-sm space-y-3">
                      <div className="relative w-full h-48 rounded-md overflow-hidden">
                        <Image
                          src={`${BASE_URL}${img.url}`}
                          alt={img.altText || "Image preview"} // Use altText if available, otherwise a generic preview
                          width={300} // Retained user's original width and height for intrinsic sizing [^1][^2]
                          height={200}
                          className="object-cover w-full h-full" // Adjusted to h-full to fill container
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${img._id}`}>Your Description</Label>
                        <Textarea
                          id={`description-${img._id}`}
                          value={img.description || ""}
                          placeholder="Describe this image for better ALT tag generation"
                          onChange={(e) => {
                            const newImages = [...images]
                            newImages[idx].description = e.target.value
                            setImages(newImages)
                          }}
                          className="min-h-[80px]"
                        />
                      </div>
                      {img.suggestedAlt && (
                        <div className="space-y-2">
                          <Label>Suggested ALT Tag</Label>
                          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm break-words">
                            {img.suggestedAlt}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <Button
                    disabled={loadingGenerate}
                    onClick={handleGenerate}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loadingGenerate ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate ALT Tags"
                    )}
                  </Button>
                  {hasSuggestedAltTags && (
                    <Button
                      disabled={loadingSave}
                      onClick={handleSaveAllAltTags}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      {loadingSave ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save All Generated ALT Tags
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
