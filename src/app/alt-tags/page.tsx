"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"

type ImageItem = {
  _id: string
  url: string
  altText?: string
  description?: string
  suggestedAlt?: string
}

export default function AltTagsPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)

  // 🔄 Load images without ALT text
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get("/api/image/no-alt") // ✅ Fixed route
        setImages(res.data.data)
      } catch (err) {
        toast.error("Failed to load images")
      }
    }
    fetchImages()
  }, [])

  // 🧠 Generate ALT tags for all images
  const handleGenerate = async () => {
    const descriptions = images.map((img) => img.description?.trim() || "Image with no description")

    if (descriptions.some((desc) => desc.length < 5)) {
      return toast.warning("Please enter descriptions with at least 5 characters.")
    }

    setLoading(true)
    try {
      const res = await axios.post("/api/image/alt-tags", {
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
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Generate Image ALT Tags</h1>
      <p className="text-gray-600">
        These images were uploaded without ALT tags. Add a description to generate SEO-optimized text.
      </p>

      {images.length === 0 && <p className="text-muted-foreground">No images found without ALT text.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, idx) => (
          <div key={img._id} className="border p-4 rounded-xl shadow-sm space-y-2">
            <Image
              src={img.url}
              alt={img.altText || "Preview"}
              width={300}
              height={200}
              className="rounded-md object-cover w-full h-48"
            />
            <Textarea
              value={img.description || ""}
              placeholder="Describe this image"
              onChange={(e) => {
                const newImages = [...images]
                newImages[idx].description = e.target.value
                setImages(newImages)
              }}
            />
            {img.suggestedAlt && (
              <div className="text-sm text-green-700 bg-green-100 p-2 rounded-md">
                <strong>Suggested ALT:</strong> {img.suggestedAlt}
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <Button disabled={loading} onClick={handleGenerate}>
          {loading ? "Generating..." : "Generate ALT Tags"}
        </Button>
      )}
    </div>
  )
}
