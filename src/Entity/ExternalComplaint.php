<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ExternalComplaint
 *
 * @ORM\Table(name="Aux_Data.External_Complaint", uniqueConstraints={@ORM\UniqueConstraint(name="Complaint-ID_UNIQUE", columns={"Complaint-ID"})})
 * @ORM\Entity
 */
class ExternalComplaint
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Complaint-ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $complaintId;



    /**
     * Get complaintId
     *
     * @return integer
     */
    public function getComplaintId()
    {
        return $this->complaintId;
    }
}
