/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type AddLolly = {
  id: string,
  sender: string,
  reciever: string,
  message: string,
  lollyTop: string,
  lollyMiddle: string,
  lollyBottom: string,
};

export type Lolly = {
  __typename: "Lolly",
  id?: string,
  sender?: string,
  reciever?: string,
  message?: string,
  lollyTop?: string,
  lollyMiddle?: string,
  lollyBottom?: string,
};

export type CreateLollyMutationVariables = {
  lolly?: AddLolly,
};

export type CreateLollyMutation = {
  createLolly?:  {
    __typename: "Lolly",
    id: string,
    sender: string,
    reciever: string,
    message: string,
    lollyTop: string,
    lollyMiddle: string,
    lollyBottom: string,
  } | null,
};

export type GetLollyByIdQueryVariables = {
  id?: string,
};

export type GetLollyByIdQuery = {
  getLollyById?:  Array< {
    __typename: "Lolly",
    id: string,
    sender: string,
    reciever: string,
    message: string,
    lollyTop: string,
    lollyMiddle: string,
    lollyBottom: string,
  } | null > | null,
};

export type GetLollyQuery = {
  getLolly?:  Array< {
    __typename: "Lolly",
    id: string,
    sender: string,
    reciever: string,
    message: string,
    lollyTop: string,
    lollyMiddle: string,
    lollyBottom: string,
  } | null > | null,
};
