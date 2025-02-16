import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";
interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}
const InputField = (props: InputFieldProps) => {
  const [field, meta] = useField(props);
  return (
    <FormControl>
      <FormControl isInvalid={!!meta.error && meta.touched}>
        <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
        <Input
          {...field}
          {...props}
          id={field.name}
          placeholder={props.placeholder}
        />
        {meta.touched && meta.error && (
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        )}
      </FormControl>
    </FormControl>
  );
};

export default InputField;
