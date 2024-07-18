import {User} from '@loopback/authentication-jwt';
import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {HotelPerformance} from './hotel-performance.model';

@model()
export class Hotel extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    required: false,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  location: string;

  @property({
    type: 'number',
    required: true,
  })
  rooms: number;

  @belongsTo(() => User)
  userId: string;

  @hasMany(() => HotelPerformance)
  hotelPerformances: HotelPerformance[];

  constructor(data?: Partial<Hotel>) {
    super(data);
  }
}

export interface HotelRelations {
  hotelPerformances?: HotelPerformance[];
}

export type HotelWithRelations = Hotel & HotelRelations;
