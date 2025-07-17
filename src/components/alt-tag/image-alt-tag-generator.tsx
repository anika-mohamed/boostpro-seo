"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ImageIcon, Upload, Sparkles, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Assuming apiClient is configured globally or passed as a prop
// For this example, I'll simulate it with fetch, but you should use your actual apiClient
// import apiClient from "@/lib/api/axios"

type ImageItem = {
  _id: string
  url: string
  altText?: string
  description?: string
  suggestedAlt?: string
}

// IMPORTANT: Ensure this matches your backend API URL
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

export function ImageAltTagGenerator() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loadingImages, setLoadingImages] = useState(true)
  const [generatingAlt, setGeneratingAlt] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // 🔄 Load images without ALT text
  const fetchImages = async () => {
    setLoadingImages(true)
    try {
      // Replace with your actual apiClient.get
      const response = await fetch(`${BASE_API_URL}/api/image/no-alt`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth
        },
      })
      if (!response.ok) {
        throw new Error("Failed to load images")
      }
      const res = await response.json()
      setImages(res.data)
    } catch (err) {
      toast.error("Failed to load images.")
      console.error("Failed to load images:", err)
    } finally {
      setLoadingImages(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  // 🧠 Generate ALT tags
  const handleGenerate = async () => {
    const descriptions = images.map((img) => img.description?.trim() || "")

    if (descriptions.some((desc) => desc.length < 5)) {
      return toast.warning("Please ensure all image descriptions are at least 5 characters long.")
    }
    if (descriptions.length === 0) {
      return toast.warning("No images with descriptions to generate ALT tags for.")
    }

    setGeneratingAlt(true)
    try {
      // Replace with your actual apiClient.post
      const response = await fetch(`${BASE_API_URL}/api/image/alt-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth
        },
        body: JSON.stringify({
          imageDescriptions: descriptions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.message || "Failed to generate ALT tags."
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += "\n" + errorData.errors.map((err: any) => err.msg || err.message).join("\n")
        }
        throw new Error(errorMessage)
      }

      const res = await response.json()
      const optimized = res.data.optimizedAltTags
      const updatedImages = images.map((img, idx) => ({
        ...img,
        suggestedAlt: optimized[idx],
      }))
      setImages(updatedImages)
      toast.success("ALT tags generated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to generate ALT tags.")
      console.error("ALT tag generation error:", err)
    } finally {
      setGeneratingAlt(false)
    }
  }

  // 📤 Handle image upload
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!uploadFile) {
      return toast.warning("Please select an image to upload.")
    }
    if (uploadDescription.trim().length < 5) {
      return toast.warning("Please provide a description of at least 5 characters for the uploaded image.")
    }

    setUploadingImage(true)
    const formData = new FormData()
    formData.append("image", uploadFile)
    formData.append("description", uploadDescription)

    try {
      // Replace with your actual apiClient.post
      const response = await fetch(`${BASE_API_URL}/api/image/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || "Image upload failed."
        throw new Error(errorMessage)
      }

      toast.success("Image uploaded successfully!")
      setUploadFile(null)
      setUploadDescription("")
      e.currentTarget.reset() // Reset form fields
      fetchImages() // Refresh the list of images
    } catch (err: any) {
      toast.error(err.message || "Image upload failed.")
      console.error("Image upload error:", err)
    } finally {
      setUploadingImage(false)
    }
  }

  // 💾 Handle applying suggested ALT text
  const handleApplyAltText = async (imageId: string, altText: string) => {
    try {
      // Replace with your actual apiClient.patch
      const response = await fetch(`${BASE_API_URL}/api/image/update-alt/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth
        },
        body: JSON.stringify({ altText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || "Failed to apply ALT text."
        throw new Error(errorMessage)
      }

      toast.success("ALT text applied successfully!")
      // Update the local state to reflect the change (remove from "no-alt" list)
      setImages((prevImages) => prevImages.filter((img) => img._id !== imageId))
    } catch (err: any) {
      toast.error(err.message || "Failed to apply ALT text.")
      console.error("Apply ALT text error:", err)
    }
  }

  return (
    <div className="space-y-8">
      {/* 📤 Upload Form */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Image
          </CardTitle>
          <CardDescription>Upload images to your website for ALT tag suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="image-file">Image File *</Label>
              <Input
                id="image-file"
                type="file"
                name="image"
                accept="image/*"
                required
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                disabled={uploadingImage}
              />
            </div>
            <div>
              <Label htmlFor="image-description">Image Description *</Label>
              <Textarea
                id="image-description"
                name="description"
                placeholder="Describe this image in detail (e.g., 'A golden retriever playing fetch in a park')"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                required
                disabled={uploadingImage}
                minLength={5}
              />
              <p className="text-sm text-gray-500 mt-1">
                Min 5 characters. This description helps generate the best ALT tag.
              </p>
            </div>
            <Button
              type="submit"
              disabled={uploadingImage || !uploadFile || uploadDescription.trim().length < 5}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Image Grid for ALT Tag Generation */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images Needing ALT Tags
          </CardTitle>
          <CardDescription>
            Provide descriptions for your images to get SEO-friendly ALT tag suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingImages ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images found without ALT text.</p>
              <p className="text-sm">Upload new images or ensure existing ones have no ALT text.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img, idx) => (
                  <div key={img._id} className="border p-4 rounded-xl shadow-sm space-y-3 bg-white">
                    <Image
                      src={`${BASE_API_URL}${img.url}`}
                      alt={img.altText || "Image preview"}
                      width={300}
                      height={200}
                      className="rounded-md object-cover w-full h-48 border"
                      onError={(e) => {
                        // Fallback for broken image links
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                        e.currentTarget.alt = "Image failed to load"
                      }}
                    />
                    <div>
                      <Label htmlFor={`description-${img._id}`}>Your Description</Label>
                      <Textarea
                        id={`description-${img._id}`}
                        value={img.description || ""}
                        placeholder="Describe this image for ALT tag generation"
                        onChange={(e) => {
                          const newImages = [...images]
                          newImages[idx].description = e.target.value
                          setImages(newImages)
                        }}
                        minLength={5}
                        className="min-h-[80px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">Min 5 characters for generation.</p>
                    </div>

                    {img.suggestedAlt && (
                      <div className="space-y-2">
                        <div>
                          <Label>Suggested ALT Tag</Label>
                          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                            <Sparkles className="h-4 w-4" />
                            <AlertDescription className="font-medium">{img.suggestedAlt}</AlertDescription>
                          </Alert>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyAltText(img._id, img.suggestedAlt!)}
                          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Apply This ALT Tag
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                disabled={generatingAlt || images.some((img) => (img.description?.trim() || "").length < 5)}
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {generatingAlt ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating ALT Tags...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate ALT Tags for All
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
