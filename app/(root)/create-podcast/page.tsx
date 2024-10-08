"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import GeneratePodcast from "@/components/GeneratePodcast";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/components/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  podcastTitle: z.string().min(2, {
    message: "Podcast title must be at least 2 characters.",
  }),
  podcastDescription: z.string().min(2, {
    message: "Podcast description must be at least 2 characters.",
  }),
});

const CreatePodcast = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioDuration, setAudioDuration] = useState(0);

  const [voicePrompt, setVoicePrompt] = useState("");
  const [voiceType, setVoiceType] = useState<string>("");
  const createPodcast = useMutation(api.podcasts.createPodcast);
  const router = useRouter();

  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Validate required fields before proceeding.
      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: "Please generate audio and image",
          variant: "destructive",
        });
        throw new Error("Please generate audio and image");
      }

      // Create podcast
      await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
      });

      toast({ title: "Podcast created successfully" });
      router.push("/");
    } catch (error) {
      console.error("Error submitting form", error);
      toast({
        title: "Error submitting form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Postcasts</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="podcastTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Podcast Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible:ring-offset-red-1"
                      placeholder="John Doe Menu Podcast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select AI Voice
              </Label>

              <Select onValueChange={(value) => setVoiceType(value)}>
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus:ring-offset-red-1"
                  )}
                >
                  <SelectValue
                    placeholder="Select AI Voice"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-red-1">
                  {voiceCategories.map((item) => (
                    <SelectItem
                      className="capitalize focus:bg-red-1"
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voiceType && (
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    className="hidden"
                  />
                )}
              </Select>
            </div>

            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-class focus-visible:ring-offset-red-1"
                      placeholder="Write a short description about your podcast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col pt-10">
            <GeneratePodcast
              voiceType={voiceType}
              voicePrompt={voicePrompt}
              audio={audioUrl}
              setAudio={setAudioUrl}
              setAudioStorageId={setAudioStorageId}
              setAudioDuration={setAudioDuration}
              setVoicePrompt={setVoicePrompt}
            />
            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />

            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-red-gradient py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                {isSubmitting ? (
                  <>
                    Submitting
                    <Loader size={20} className="animate-spin ml-2" />
                  </>
                ) : (
                  "Submit & Publish Podcast"
                )}
              </Button>
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </section>
  );
};

export default CreatePodcast;
