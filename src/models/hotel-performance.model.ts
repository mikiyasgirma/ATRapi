import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Hotel} from './hotel.model';

@model()
export class HotelPerformance extends Entity {
  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt: Date;

  @property({
    type: 'number',
    id: true,
    generated: true,
    required: false,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  availableRooms: number;

  @property({
    type: 'number',
    required: true,
  })
  sold_rooms: number;

  @property({
    type: 'number',
    required: true,
  })
  revenue: number;

  @belongsTo(() => Hotel)
  hotelId: number;

  constructor(data?: Partial<HotelPerformance>) {
    super(data);
  }
}

export interface HotelPerformanceRelations {
  hotel?: Hotel;
}

export type HotelPerformanceWithRelations = HotelPerformance &
  HotelPerformanceRelations;
