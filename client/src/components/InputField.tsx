import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  as?: "input" | "textarea";
}

const InputField: React.FC<InputFieldProps> = ({ as = "input", ...props }) => {
  const [field, meta] = useField(props);

  return (
    <FormControl isInvalid={!!meta.error && meta.touched}>
      <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
      {as === "textarea" ? (
        <Textarea {...field} {...props} />
      ) : (
        <Input {...field} {...props} />
      )}
      {meta.touched && meta.error && (
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default InputField;
