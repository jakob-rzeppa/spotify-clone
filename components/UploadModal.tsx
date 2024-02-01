import { useForm, FieldValues } from "react-hook-form";

import useUploadModal from "@/hooks/useUploadModal";
import Modal from "./Modal"

const UploadModal = () => {
    const uploadModal = useUploadModal();

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
            // Reset the form
            uploadModal.onClose();
        }
    }

    return (
        <Modal title="Add a song" description="Upload an mp3 file" isOpen={uploadModal.isOpen} onChange={onChange}>
            Form
        </Modal>
    )
}

export default UploadModal;