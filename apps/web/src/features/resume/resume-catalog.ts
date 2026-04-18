import { defineCatalog } from "@json-render/core";
import { defineRegistry } from "@json-render/react";
import { schema } from "@json-render/react/schema";
import { shadcnComponents } from "@json-render/shadcn";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";

const resumeCatalog = defineCatalog(schema, {
  components: {
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Separator: shadcnComponentDefinitions.Separator,
    Heading: shadcnComponentDefinitions.Heading,
    Text: shadcnComponentDefinitions.Text,
    Badge: shadcnComponentDefinitions.Badge,
    Link: shadcnComponentDefinitions.Link,
  },
  actions: {},
});

export const { registry: resumeRegistry } = defineRegistry(resumeCatalog, {
  components: {
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,
    Heading: shadcnComponents.Heading,
    Text: shadcnComponents.Text,
    Badge: shadcnComponents.Badge,
    Link: shadcnComponents.Link,
  },
});

export { resumeCatalog };
