"use client";

import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import uniqueid from "uniqid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

import useUploadModal from "@/hooks/useUploadModal";
import Modal from "./Modal"
import Input from "./Input";
import Button from "./Button";
import { useUser } from "@/hooks/useUser";

const UploadModal = () => {
    const uploadModal = useUploadModal();
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            author: "",
            title: "",
            song: null,
            image: null
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];

            if (!imageFile || !songFile || !user) {
                toast.error("Missing fields");
                setIsLoading(false);
                return;
            }

            const uniqueID = uniqueid();

            // Upload song
            const {
                data: songData,
                error: songError
            } = await supabaseClient.storage.from("songs").upload(`song-${values.title}-${uniqueID}`, songFile, { cacheControl: "3600", upsert: false });

            if (songError) {
                setIsLoading(false);
                return toast.error("Failed song upload.");
            }

            // Upload image
            const {
                data: imageData,
                error: imageError
            } = await supabaseClient.storage.from("images").upload(`image-${values.title}-${uniqueID}`, imageFile, { cacheControl: "3600", upsert: false });

            if (imageError) {
                await supabaseClient.storage.from("songs").remove([songData.path]);
                setIsLoading(false);
                return toast.error("Failed image upload.");
            }

            const {
                error: supabaseError
            } = await supabaseClient.from("songs").insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                image_path: imageData.path,
                song_path: songData.path
            });

            if (supabaseError) {
                await supabaseClient.storage.from("songs").remove([songData.path]);
                await supabaseClient.storage.from("images").remove([imageData.path]);
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Song created!");
            reset();
            uploadModal.onClose();

        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal title="Add a song" description="Upload an mp3 file" isOpen={uploadModal.isOpen} onChange={onChange}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input id="title" disabled={isLoading} {...register("title", { required: true })} placeholder="Song Title"/>
                <Input id="author" disabled={isLoading} {...register("author", { required: true })} placeholder="Song Author"/>
                <div>
                    <div className="pb-1">
                        Select a Song File (mp3)
                    </div>
                    <Input id="song" type="file" disabled={isLoading} accept=".mp3" {...register("song", { required: true })} placeholder="Song"/>
                </div>
                <div>
                    <div className="pb-1">
                        Select an Image
                    </div>
                    <Input id="image" type="file" disabled={isLoading} accept="image/*" {...register("image", { required: true })} placeholder="Image"/>
                </div>
                <Button disabled={isLoading} type="submit">
                    Create
                </Button>
            </form>
        </Modal>
    )
}

export default UploadModal;