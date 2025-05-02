import { useEffect, useRef } from "react";
import { Input } from "@nextui-org/react";

export function PlacesAutocomplete({
  onSelect,
  defaultValue = "",
  error,
  register,
}) {
  const inputRef = useRef();
  const autocompleteRef = useRef();

  useEffect(() => {
    if (window.google && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (place.geometry) {
          onSelect(place.formatted_address, {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      });
    }
  }, [onSelect]);

  return (
    <Input
      {...register("location")} // Add this line
      ref={(e) => {
        inputRef.current = e;
        if (register) {
          register("location").ref(e);
        }
      }}
      label="Location"
      placeholder="Start typing to search locations..."
      defaultValue={defaultValue}
      isInvalid={!!error}
      errorMessage={error}
    />
  );
}
